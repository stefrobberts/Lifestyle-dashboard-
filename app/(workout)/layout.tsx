import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Eigen, kale layout voor de workout modus: geen navigatiebalk of snelle
 * actieknop, zodat het scherm volledig gewijd is aan de workout (groot,
 * simpel, met één hand te bedienen).
 */
export default async function WorkoutLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <div className="min-h-svh">{children}</div>;
}
