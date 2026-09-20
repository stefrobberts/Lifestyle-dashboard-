const BASE_URL = "https://world.openfoodfacts.org";
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

type OffApiProduct = {
  code?: string;
  product_name?: string;
  product_name_nl?: string;
  brands?: string;
  nutriments?: Record<string, number>;
};

function mapOffProduct(raw: OffApiProduct): OpenFoodFactsProduct | null {
  const name = raw.product_name_nl || raw.product_name;
  const n = raw.nutriments ?? {};
  const calories = n["energy-kcal_100g"];

  if (!name || !raw.code || calories === undefined) return null;

  return {
    barcode: raw.code,
    name,
    brand: raw.brands?.split(",")[0]?.trim() || null,
    calories_per_100g: Math.round(calories),
    protein_per_100g: n["proteins_100g"] ?? 0,
    carbs_per_100g: n["carbohydrates_100g"] ?? 0,
    fat_per_100g: n["fat_100g"] ?? 0,
  };
}

export async function searchProductsByName(
  query: string
): Promise<OpenFoodFactsProduct[]> {
  const url = new URL(`${BASE_URL}/cgi/search.pl`);
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "15");
  url.searchParams.set(
    "fields",
    "code,product_name,product_name_nl,brands,nutriments"
  );

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) return [];

  const data = (await response.json()) as { products?: OffApiProduct[] };
  return (data.products ?? [])
    .map(mapOffProduct)
    .filter((p): p is OpenFoodFactsProduct => p !== null);
}

export async function lookupProductByBarcode(
  barcode: string
): Promise<OpenFoodFactsProduct | null> {
  const url = new URL(`${BASE_URL}/api/v2/product/${encodeURIComponent(barcode)}`);
  url.searchParams.set(
    "fields",
    "code,product_name,product_name_nl,brands,nutriments"
  );

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { status: number; product?: OffApiProduct };
  if (data.status !== 1 || !data.product) return null;

  return mapOffProduct(data.product);
}
