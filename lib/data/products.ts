"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { searchProductsByName, lookupProductByBarcode } from "@/lib/openFoodFacts";
import { customProductSchema } from "@/lib/validations/recipe";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd.");
  return { supabase, user };
}

export type SearchResultProduct = {
  id: string | null;
  off_barcode: string | null;
  name: string;
  brand: string | null;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  is_favorite: boolean;
  is_off: boolean;
};

/** Zoekt eerst in eigen producten (favorieten/recent), vult aan met Open Food Facts. */
export async function searchProducts(query: string): Promise<SearchResultProduct[]> {
  const { supabase } = await requireUser();

  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const { data: ownProducts } = await supabase
    .from("products")
    .select("*")
    .ilike("name", `%${trimmed}%`)
    .order("is_favorite", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(10);

  const own: SearchResultProduct[] = (ownProducts ?? []).map((p) => ({
    id: p.id,
    off_barcode: p.off_barcode,
    name: p.name,
    brand: p.brand,
    calories_per_100g: p.calories_per_100g,
    protein_per_100g: p.protein_per_100g,
    carbs_per_100g: p.carbs_per_100g,
    fat_per_100g: p.fat_per_100g,
    is_favorite: p.is_favorite,
    is_off: p.source === "off",
  }));

  const knownBarcodes = new Set(own.map((p) => p.off_barcode).filter(Boolean));

  let offResults: SearchResultProduct[] = [];
  try {
    const results = await searchProductsByName(trimmed);
    offResults = results
      .filter((r) => !knownBarcodes.has(r.barcode))
      .map((r) => ({
        id: null,
        off_barcode: r.barcode,
        name: r.name,
        brand: r.brand,
        calories_per_100g: r.calories_per_100g,
        protein_per_100g: r.protein_per_100g,
        carbs_per_100g: r.carbs_per_100g,
        fat_per_100g: r.fat_per_100g,
        is_favorite: false,
        is_off: true,
      }));
  } catch {
    // Open Food Facts niet bereikbaar: toon alleen eigen producten.
  }

  return [...own, ...offResults].slice(0, 20);
}

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Haalt een OFF-product op via barcode en zet 'm (indien nodig) in onze eigen tabel. */
export async function lookupAndCacheBarcode(
  barcode: string
): Promise<ActionResult<{ productId: string }>> {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("off_barcode", barcode)
    .maybeSingle();

  if (existing) {
    return { success: true, data: { productId: existing.id } };
  }

  const offProduct = await lookupProductByBarcode(barcode);
  if (!offProduct) {
    return { success: false, error: "Product niet gevonden bij deze barcode." };
  }

  const { data: inserted, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      source: "off",
      off_barcode: offProduct.barcode,
      name: offProduct.name,
      brand: offProduct.brand,
      calories_per_100g: offProduct.calories_per_100g,
      protein_per_100g: offProduct.protein_per_100g,
      carbs_per_100g: offProduct.carbs_per_100g,
      fat_per_100g: offProduct.fat_per_100g,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { success: false, error: "Opslaan van product is niet gelukt." };
  }

  return { success: true, data: { productId: inserted.id } };
}

/** Zet een gekozen OFF-zoekresultaat (nog geen barcode-lookup gedaan) om naar een eigen product. */
export async function cacheOffSearchResult(
  product: SearchResultProduct
): Promise<ActionResult<{ productId: string }>> {
  if (product.id) {
    return { success: true, data: { productId: product.id } };
  }
  if (!product.off_barcode) {
    return { success: false, error: "Onbekend product." };
  }
  return lookupAndCacheBarcode(product.off_barcode);
}

export async function createCustomProduct(
  formData: FormData
): Promise<ActionResult<{ productId: string }>> {
  const parsed = customProductSchema.safeParse({
    name: formData.get("name"),
    brand: formData.get("brand") || undefined,
    calories_per_100g: formData.get("calories_per_100g"),
    protein_per_100g: formData.get("protein_per_100g"),
    carbs_per_100g: formData.get("carbs_per_100g"),
    fat_per_100g: formData.get("fat_per_100g"),
    default_portion_g: formData.get("default_portion_g") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { supabase, user } = await requireUser();

  const { data: inserted, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      source: "custom",
      name: parsed.data.name,
      brand: parsed.data.brand ?? null,
      calories_per_100g: parsed.data.calories_per_100g,
      protein_per_100g: parsed.data.protein_per_100g,
      carbs_per_100g: parsed.data.carbs_per_100g,
      fat_per_100g: parsed.data.fat_per_100g,
      default_portion_g: parsed.data.default_portion_g ?? null,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { success: false, error: "Aanmaken is niet gelukt." };
  }

  revalidatePath("/voeding");
  return { success: true, data: { productId: inserted.id } };
}

export async function toggleProductFavorite(
  productId: string,
  favorite: boolean
): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("products")
    .update({ is_favorite: favorite })
    .eq("id", productId);

  if (error) {
    return { success: false, error: "Opslaan is niet gelukt." };
  }

  revalidatePath("/voeding");
  return { success: true, data: undefined };
}
