import { SupabaseClient } from "@supabase/supabase-js";

export async function getDashboardData(
  supabase: SupabaseClient,
  year: number,
  month: number
) {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const to = new Date(year, month, 0).toISOString().split("T")[0];

  const [{ data: expenses }, { data: members }] = await Promise.all([
    supabase
      .from("expenses")
      .select("*, paid_by_member:members!expenses_paid_by_fkey(id, full_name)")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: false }),
    supabase.from("members").select("id, full_name"),
  ]);

  const totalSpent = (expenses ?? []).reduce((s, e) => s + Number(e.amount), 0);

  // Spending by category
  const byCategory: Record<string, number> = {};
  for (const e of expenses ?? []) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + Number(e.amount);
  }
  const categoryData = Object.entries(byCategory).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  // Payment by member
  const byMember: Record<string, { name: string; paid: number }> = {};
  for (const m of members ?? []) {
    byMember[m.id] = { name: m.full_name, paid: 0 };
  }
  for (const e of expenses ?? []) {
    if (byMember[e.paid_by]) {
      byMember[e.paid_by].paid += Number(e.amount);
    }
  }
  const memberData = Object.values(byMember).map((m) => ({
    name: m.name,
    paid: parseFloat(m.paid.toFixed(2)),
  }));

  return { expenses: expenses ?? [], members: members ?? [], totalSpent, categoryData, memberData };
}

export async function getMonthlyTrend(supabase: SupabaseClient) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });

  const results = await Promise.all(
    months.map(async ({ year, month }) => {
      const from = `${year}-${String(month).padStart(2, "0")}-01`;
      const to = new Date(year, month, 0).toISOString().split("T")[0];
      const { data } = await supabase
        .from("expenses")
        .select("amount")
        .gte("date", from)
        .lte("date", to);
      const total = (data ?? []).reduce((s, e) => s + Number(e.amount), 0);
      return {
        month: new Date(year, month - 1).toLocaleString("default", { month: "short" }),
        total: parseFloat(total.toFixed(2)),
      };
    })
  );
  return results;
}

export function computeSettlements(
  expenses: { amount: number; paid_by: string; is_split: boolean; paid_by_member: { id: string; full_name: string } | null }[],
  members: { id: string; full_name: string }[]
) {
  const memberCount = members.length;
  if (memberCount === 0) return [];

  const balance: Record<string, number> = {};
  for (const m of members) balance[m.id] = 0;

  for (const e of expenses) {
    if (!e.is_split) continue;
    const share = Number(e.amount) / memberCount;
    balance[e.paid_by] = (balance[e.paid_by] ?? 0) + Number(e.amount) - share;
    for (const m of members) {
      if (m.id !== e.paid_by) {
        balance[m.id] = (balance[m.id] ?? 0) - share;
      }
    }
  }

  const nameMap = Object.fromEntries(members.map((m) => [m.id, m.full_name]));
  const settlements: { from: string; to: string; amount: number }[] = [];

  const debtors = members.filter((m) => balance[m.id] < -0.01).map((m) => ({ ...m, bal: balance[m.id] }));
  const creditors = members.filter((m) => balance[m.id] > 0.01).map((m) => ({ ...m, bal: balance[m.id] }));

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(-debtors[i].bal, creditors[j].bal);
    if (pay > 0.01) {
      settlements.push({
        from: nameMap[debtors[i].id],
        to: nameMap[creditors[j].id],
        amount: parseFloat(pay.toFixed(2)),
      });
    }
    debtors[i].bal += pay;
    creditors[j].bal -= pay;
    if (Math.abs(debtors[i].bal) < 0.01) i++;
    if (Math.abs(creditors[j].bal) < 0.01) j++;
  }

  return settlements;
}
