const PRODUCT_API_URL = "https://world.openfoodfacts.org";
const SEARCH_API_URL = "https://search.openfoodfacts.org";
const USER_AGENT = "LifestyleDashboard/1.0 (persoonlijk gebruik)";

export type OpenFoodFactsProduct = {
  barcode: string;
  name: string;
  brand: string | null;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
};

function macrosFromNutriments(
  n: Record<string, number> | undefined
): Pick<
  OpenFoodFactsProduct,
  "calories_per_100g" | "protein_per_100g" | "carbs_per_100g" | "fat_per_100g"
> | null {
  const calories = n?.["energy-kcal_100g"];
  if (calories === undefined) return null;

  return {
    calories_per_100g: Math.round(calories),
    protein_per_100g: n?.["proteins_100g"] ?? 0,
    carbs_per_100g: n?.["carbohydrates_100g"] ?? 0,
    fat_per_100g: n?.["fat_100g"] ?? 0,
  };
}

// De zoek-API (search-a-licious) geeft merken terug als array.
type OffSearchHit = {
  code?: string;
  product_name?: string;
  product_name_nl?: string;
  brands?: string[];
  nutriments?: Record<string, number>;
};

function mapSearchHit(hit: OffSearchHit): OpenFoodFactsProduct | null {
  const name = hit.product_name_nl || hit.product_name;
  const macros = macrosFromNutriments(hit.nutriments);
  if (!name || !hit.code || !macros) return null;

  return {
    barcode: hit.code,
    name,
    brand: hit.brands?.[0] ?? null,
    ...macros,
  };
}

/** Zoekt op naam, met voorkeur voor Nederlandstalige en populaire producten. */
export async function searchProductsByName(
  query: string
): Promise<OpenFoodFactsProduct[]> {
  const url = new URL(`${SEARCH_API_URL}/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("langs", "nl");
  url.searchParams.set("sort_by", "-unique_scans_n");
  url.searchParams.set("page_size", "20");
  url.searchParams.set(
    "fields",
    "code,product_name,product_name_nl,brands,nutriments"
  );

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) return [];

  const data = (await response.json()) as { hits?: OffSearchHit[] };
  return (data.hits ?? [])
    .map(mapSearchHit)
    .filter((p): p is OpenFoodFactsProduct => p !== null);
}

// De product-API (barcode-opzoeking) geeft merken terug als komma-gescheiden tekst.
type OffLookupProduct = {
  code?: string;
  product_name?: string;
  product_name_nl?: string;
  brands?: string;
  nutriments?: Record<string, number>;
};

export async function lookupProductByBarcode(
  barcode: string
): Promise<OpenFoodFactsProduct | null> {
  const url = new URL(`${PRODUCT_API_URL}/api/v2/product/${encodeURIComponent(barcode)}`);
  url.searchParams.set(
    "fields",
    "code,product_name,product_name_nl,brands,nutriments"
  );

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    status: number;
    product?: OffLookupProduct;
  };
  if (data.status !== 1 || !data.product) return null;

  const raw = data.product;
  const name = raw.product_name_nl || raw.product_name;
  const macros = macrosFromNutriments(raw.nutriments);
  if (!name || !raw.code || !macros) return null;

  return {
    barcode: raw.code,
    name,
    brand: raw.brands?.split(",")[0]?.trim() || null,
    ...macros,
  };
}
