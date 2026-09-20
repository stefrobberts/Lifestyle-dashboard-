import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { dateKey } from "@/lib/date";

type Client = SupabaseClient<Database>;

const DEFAULT_TASKS: {
  title: string;
  category: "supplement" | "verzorging";
}[] = [
  { title: "Vitamine D", category: "supplement" },
  { title: "Creatine", category: "supplement" },
  { title: "Eiwitpoeder", category: "supplement" },
  { title: "Dagcrème", category: "verzorging" },
  { title: "Serum", category: "verzorging" },
];

const DEFAULT_CARD_KEYS = [
  "voeding",
  "sport",
  "werk",
  "verzorging",
  "gewicht",
] as const;

/** Zorgt dat een nieuwe gebruiker een standaard checklist, kaartvolgorde en instellingen heeft. */
export async function ensureDefaultData(supabase: Client, userId: string) {
  const { count: taskCount } = await supabase
    .from("daily_task_definitions")
    .select("id", { count: "exact", head: true });

  if (!taskCount) {
    await supabase.from("daily_task_definitions").insert(
      DEFAULT_TASKS.map((task, index) => ({
        user_id: userId,
        title: task.title,
        category: task.category,
        frequency_type: "daily" as const,
        sort_order: index,
      }))
    );
  }

  const { count: cardCount } = await supabase
    .from("dashboard_card_prefs")
    .select("id", { count: "exact", head: true });

  if (!cardCount) {
    await supabase.from("dashboard_card_prefs").insert(
      DEFAULT_CARD_KEYS.map((cardKey, index) => ({
        user_id: userId,
        card_key: cardKey,
        sort_order: index,
      }))
    );
  }

  const { count: settingsCount } = await supabase
    .from("user_settings")
    .select("id", { count: "exact", head: true });

  if (!settingsCount) {
    await supabase.from("user_settings").insert({ user_id: userId });
  }
}

export async function fetchVandaagData(supabase: Client) {
  const today = new Date();
  const todayKey = dateKey(today);
  const lookbackStart = new Date(today);
  lookbackStart.setDate(lookbackStart.getDate() - 400);

  const [definitionsRes, logsRes, cardPrefsRes, settingsRes] = await Promise.all([
    supabase
      .from("daily_task_definitions")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("daily_task_logs")
      .select("task_definition_id, completed_date")
      .gte("completed_date", dateKey(lookbackStart)),
    supabase
      .from("dashboard_card_prefs")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase.from("user_settings").select("*").maybeSingle(),
  ]);

  return {
    today,
    todayKey,
    definitions: definitionsRes.data ?? [],
    logs: logsRes.data ?? [],
    cardPrefs: cardPrefsRes.data ?? [],
    settings: settingsRes.data,
  };
}
