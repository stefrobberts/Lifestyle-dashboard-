import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { dateKey, isoWeekday } from "@/lib/date";

type Client = SupabaseClient<Database>;

const DEFAULT_CATEGORIES = ["Klantwerk", "Eigen bedrijf", "Persoonlijk"];

/** Zet de werkcategorieën uit de intake klaar. Race-veilig via een atomaire claim. */
export async function ensureDefaultWorkCategories(supabase: Client, userId: string) {
  const { data: claimed } = await supabase
    .from("user_settings")
    .update({ work_categories_seeded: true })
    .eq("user_id", userId)
    .eq("work_categories_seeded", false)
    .select("id");

  if (!claimed || claimed.length === 0) return;

  await supabase.from("work_categories").insert(
    DEFAULT_CATEGORIES.map((name, index) => ({
      user_id: userId,
      name,
      sort_order: index,
    }))
  );
}

/** Vult Werk bij de eerste keer met een paar voorbeelden. Race-veilig via een atomaire claim. */
export async function ensureSampleWorkData(supabase: Client, userId: string) {
  const { data: claimed } = await supabase
    .from("user_settings")
    .update({ sample_work_seeded: true })
    .eq("user_id", userId)
    .eq("sample_work_seeded", false)
    .select("id");

  if (!claimed || claimed.length === 0) return;

  const { data: categories } = await supabase
    .from("work_categories")
    .select("id, name");

  const categoryId = (name: string) => categories?.find((c) => c.name === name)?.id ?? null;

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(monday.getDate() - (isoWeekday(today) - 1));

  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);

  // PostgREST vereist dat alle objecten in een bulk-insert exact dezelfde
  // sleutels hebben (anders faalt de hele batch met PGRST102) — dus elk
  // taak-object hieronder krijgt bewust alle velden, ook als leeg/null.
  const { error: tasksError } = await supabase.from("work_tasks").insert([
    {
      user_id: userId,
      title: "Weekplanning maken",
      notes: "Prioriteiten voor de week doornemen.",
      deadline: dateKey(monday),
      priority: "normaal",
      recurrence_type: "wekelijks",
      category_id: categoryId("Eigen bedrijf"),
    },
    {
      user_id: userId,
      title: "Factuur versturen",
      notes: null,
      deadline: dateKey(friday),
      priority: "hoog",
      recurrence_type: "geen",
      category_id: categoryId("Klantwerk"),
    },
    {
      user_id: userId,
      title: "Portfolio bijwerken",
      notes: null,
      deadline: null,
      priority: "laag",
      recurrence_type: "geen",
      category_id: categoryId("Persoonlijk"),
    },
  ]);
  if (tasksError) console.error("ensureSampleWorkData: taken seeden mislukt", tasksError);

  const { error: ideaError } = await supabase.from("linkedin_ideas").insert({
    user_id: userId,
    subject: "Hoe ik mijn workflow met AI heb versneld",
    hook: "Een jaar geleden deed ik dit nog volledig handmatig.",
    body: "Uitwerken: welke tools, wat het opleverde, een concreet voorbeeld.",
    tags: ["ai", "productiviteit"],
    status: "idee",
  });
  if (ideaError) console.error("ensureSampleWorkData: LinkedIn-idee seeden mislukt", ideaError);

  const { error: noteError } = await supabase.from("work_notes").insert({
    user_id: userId,
    title: "Ideeën voor volgend kwartaal",
    content: "Losse gedachtes en dingen om later verder uit te werken.",
  });
  if (noteError) console.error("ensureSampleWorkData: notitie seeden mislukt", noteError);
}

export async function fetchWorkCategories(supabase: Client) {
  const { data } = await supabase
    .from("work_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function fetchTasks(supabase: Client) {
  const { data } = await supabase
    .from("work_tasks")
    .select("*, work_categories(name)")
    .is("parent_task_id", null)
    .order("deadline", { ascending: true, nullsFirst: false });

  return data ?? [];
}

export async function fetchSubtasks(supabase: Client, parentTaskId: string) {
  const { data } = await supabase
    .from("work_tasks")
    .select("*")
    .eq("parent_task_id", parentTaskId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function fetchSubtaskCounts(supabase: Client, parentTaskIds: string[]) {
  if (parentTaskIds.length === 0) return new Map<string, { total: number; done: number }>();

  const { data } = await supabase
    .from("work_tasks")
    .select("parent_task_id, completed_at")
    .in("parent_task_id", parentTaskIds);

  const counts = new Map<string, { total: number; done: number }>();
  for (const row of data ?? []) {
    const key = row.parent_task_id!;
    const current = counts.get(key) ?? { total: 0, done: 0 };
    current.total += 1;
    if (row.completed_at) current.done += 1;
    counts.set(key, current);
  }
  return counts;
}

export async function fetchLinkedinIdeas(supabase: Client) {
  const { data } = await supabase
    .from("linkedin_ideas")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchWorkNotes(supabase: Client, query?: string) {
  let request = supabase
    .from("work_notes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (query && query.trim().length > 0) {
    request = request.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
  }

  const { data } = await request;
  return data ?? [];
}

export async function fetchUnprocessedInboxNotes(supabase: Client) {
  const { data } = await supabase
    .from("inbox_notes")
    .select("*")
    .eq("is_processed", false)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchUnprocessedInboxCount(supabase: Client) {
  const { count } = await supabase
    .from("inbox_notes")
    .select("id", { count: "exact", head: true })
    .eq("is_processed", false);
  return count ?? 0;
}

export async function fetchLinkedinIdea(supabase: Client, ideaId: string) {
  const { data } = await supabase
    .from("linkedin_ideas")
    .select("*")
    .eq("id", ideaId)
    .maybeSingle();
  return data;
}

const IMAGE_URL_EXPIRES_IN = 60 * 60; // 1 uur

export async function getLinkedinImageUrl(supabase: Client, imagePath: string | null) {
  if (!imagePath) return null;
  const { data } = await supabase.storage
    .from("linkedin-images")
    .createSignedUrl(imagePath, IMAGE_URL_EXPIRES_IN);
  return data?.signedUrl ?? null;
}

const PRIORITY_RANK: Record<string, number> = { hoog: 0, normaal: 1, laag: 2 };

/** Aantal openstaande taken voor vandaag (inclusief te laat) en de hoogste prioriteit. */
export async function fetchTodaysTaskSummary(supabase: Client, todayKey: string) {
  const { data } = await supabase
    .from("work_tasks")
    .select("priority")
    .is("parent_task_id", null)
    .is("completed_at", null)
    .lte("deadline", todayKey)
    .not("deadline", "is", null);

  const tasks = data ?? [];
  const topPriority = tasks.length
    ? tasks.reduce((top, t) =>
        PRIORITY_RANK[t.priority] < PRIORITY_RANK[top.priority] ? t : top
      ).priority
    : null;

  return { count: tasks.length, topPriority: topPriority as "hoog" | "normaal" | "laag" | null };
}
