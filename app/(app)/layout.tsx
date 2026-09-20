import { redirect } from "next/navigation";
import { BottomNav } from "@/components/navigation/BottomNav";
import { QuickActionButton } from "@/components/quick-actions/QuickActionButton";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-svh flex-col">
      <main className="safe-top flex-1 pb-28">{children}</main>
      <QuickActionButton />
      <BottomNav />
    </div>
  );
}
