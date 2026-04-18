import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold text-gray-800">
        Welcome, {member?.full_name ?? "Member"}
      </h1>
      <p className="mt-2 text-gray-500">Dashboard coming soon.</p>
    </main>
  );
}
