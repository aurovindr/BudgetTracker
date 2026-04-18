import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData, getMonthlyTrend, computeSettlements } from "@/lib/dashboard";
import AppShell from "@/components/layout/AppShell";
import DashboardClient from "./DashboardClient";

interface PageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
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

  const [{ expenses, members, totalSpent, categoryData, memberData }, trendData] =
    await Promise.all([
      getDashboardData(supabase, year, month),
      getMonthlyTrend(supabase),
    ]);

  const settlements = computeSettlements(
    expenses as Parameters<typeof computeSettlements>[0],
    members
  );

  const memberCount = members.length || 1;

  const myPaid = expenses
    .filter((e) => e.paid_by === user.id)
    .reduce((s, e) => s + Number(e.amount), 0);

  const myShare = expenses
    .filter((e) => e.is_split)
    .reduce((s, e) => s + Number(e.amount) / memberCount, 0);

  const pendingSettlement = settlements
    .filter((s) => s.from === member?.full_name)
    .reduce((sum, s) => sum + s.amount, 0);

  const totalShared = expenses
    .filter((e) => e.is_split)
    .reduce((s, e) => s + Number(e.amount), 0);

  const perHead = totalShared / memberCount;

  const myPaidInShared = expenses
    .filter((e) => e.is_split && e.paid_by === user.id)
    .reduce((s, e) => s + Number(e.amount), 0);

  const youCovered = myPaidInShared - perHead;

  return (
    <AppShell memberId={user.id} memberName={member?.full_name ?? "Member"}>
      <DashboardClient
        memberName={member?.full_name ?? "Member"}
        year={year}
        month={month}
        totalSpent={totalSpent}
        myPaid={myPaid}
        myShare={myShare}
        pendingSettlement={pendingSettlement}
        totalShared={totalShared}
        perHead={perHead}
        youCovered={youCovered}
        categoryData={categoryData}
        memberData={memberData}
        trendData={trendData}
        settlements={settlements}
      />
    </AppShell>
  );
}
