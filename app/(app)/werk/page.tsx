import { createClient } from "@/lib/supabase/server";
import { ensureDefaultData } from "@/lib/data/vandaag";
import {
  ensureDefaultWorkCategories,
  ensureSampleWorkData,
  fetchSubtaskCounts,
  fetchTasks,
  fetchUnprocessedInboxCount,
  fetchWorkCategories,
} from "@/lib/data/work";
import { dateKey } from "@/lib/date";
import { WerkTabs } from "@/components/werk/WerkTabs";
import { TaskList, type TaskListItem } from "@/components/werk/TaskList";

export default async function WerkPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  await ensureDefaultData(supabase, user.id);
  await ensureDefaultWorkCategories(supabase, user.id);
  await ensureSampleWorkData(supabase, user.id);

  const [tasks, categories, inboxCount] = await Promise.all([
    fetchTasks(supabase),
    fetchWorkCategories(supabase),
    fetchUnprocessedInboxCount(supabase),
  ]);

  const subtaskCounts = await fetchSubtaskCounts(
    supabase,
    tasks.map((t) => t.id)
  );

  const taskItems: TaskListItem[] = tasks.map((task) => {
    const progress = subtaskCounts.get(task.id) ?? null;
    return {
      id: task.id,
      title: task.title,
      deadline: task.deadline,
      priority: task.priority as TaskListItem["priority"],
      completed: Boolean(task.completed_at),
      recurrenceType: task.recurrence_type as TaskListItem["recurrenceType"],
      categoryName: task.work_categories?.name ?? null,
      categoryId: task.category_id,
      notes: task.notes,
      subtaskProgress: progress && progress.total > 0 ? progress : null,
    };
  });

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <h1 className="font-heading text-2xl font-bold">Werk</h1>
      <WerkTabs active="/werk" inboxCount={inboxCount} />
      <TaskList
        initialTasks={taskItems}
        categories={categories}
        todayKey={dateKey(new Date())}
      />
    </div>
  );
}
