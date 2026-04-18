import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";
import ExpensesClient from "./ExpensesClient";

interface PageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function ExpensesPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const params = await searchParams;
  const now = new Date();
  const year = parseInt(params.year ?? String(now.getFullYear()));
  const month = parseInt(params.month ?? String(now.getMonth() + 1));

  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const to = new Date(year, month, 0).toISOString().split("T")[0];

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*, paid_by, paid_by_member:members!expenses_paid_by_fkey(full_name)")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: false });

  return (
    <AppShell memberId={user.id} memberName={member?.full_name ?? "Member"}>
      <ExpensesClient
        expenses={expenses ?? []}
        year={year}
        month={month}
        currentMemberId={user.id}
      />
    </AppShell>
  );
}
