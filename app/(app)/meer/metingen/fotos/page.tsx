import { createClient } from "@/lib/supabase/server";
import { fetchProgressPhotos, getProgressPhotoUrls } from "@/lib/data/measurements";
import { MetingenTabs } from "@/components/metingen/MetingenTabs";
import { PhotoGrid, type PhotoItem } from "@/components/metingen/PhotoGrid";

export default async function MetingenFotosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const photos = await fetchProgressPhotos(supabase);
  const urls = await getProgressPhotoUrls(
    supabase,
    photos.map((p) => p.photo_path)
  );

  const items: PhotoItem[] = photos
    .filter((p) => urls.has(p.photo_path))
    .map((p) => ({
      id: p.id,
      url: urls.get(p.photo_path)!,
      photoPath: p.photo_path,
      takenAt: p.taken_at,
      weightKg: p.weight_kg,
    }));

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <h1 className="font-heading text-2xl font-bold">Metingen</h1>

      <MetingenTabs active="/meer/metingen/fotos" />

      <PhotoGrid initialPhotos={items} />
    </div>
  );
}
