"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { CATEGORY_COLORS, Category } from "@/lib/constants";

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  is_split: boolean;
  is_recurring: boolean;
  paid_by_member: { full_name: string } | null;
}

interface Props {
  expenses: Expense[];
  year: number;
  month: number;
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function groupByDate(expenses: Expense[]) {
  const groups: Record<string, Expense[]> = {};
  for (const e of expenses) {
    if (!groups[e.date]) groups[e.date] = [];
    groups[e.date].push(e);
  }
  return groups;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export default function ExpensesClient({ expenses, year, month }: Props) {
  const router = useRouter();
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const minDate = new Date();
  minDate.setMonth(minDate.getMonth() - 5);
  const isMinMonth = year < minDate.getFullYear() ||
    (year === minDate.getFullYear() && month <= minDate.getMonth() + 1);

  function navigate(dir: -1 | 1) {
    const d = new Date(year, month - 1 + dir);
    router.push(`/expenses?year=${d.getFullYear()}&month=${d.getMonth() + 1}`);
  }

  const grouped = groupByDate(expenses);
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold text-gray-800 pt-2">Expenses</h1>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2 shadow-sm">
        <button onClick={() => navigate(-1)} disabled={isMinMonth} className="p-1 disabled:opacity-30">
          <ChevronLeft size={20} />
        </button>
        <span className="font-medium text-gray-700">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button onClick={() => navigate(1)} disabled={isCurrentMonth} className="p-1 disabled:opacity-30">
          <ChevronRight size={20} />
        </button>
      </div>

      {dates.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">No expenses for this month.</p>
      ) : (
        dates.map((date) => (
          <div key={date}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {formatDate(date)}
            </p>
            <div className="space-y-2">
              {grouped[date].map((e) => (
                <div
                  key={e.id}
                  className="bg-white rounded-xl p-4 shadow-sm flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[e.category as Category] ?? "#94a3b8", marginTop: 6 }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{e.description}</p>
                      <p className="text-xs text-gray-500">{e.category}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Paid by {e.paid_by_member?.full_name ?? "—"}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {e.is_split && (
                          <span className="text-xs bg-blue-50 text-blue-600 rounded px-1.5 py-0.5">Split</span>
                        )}
                        {e.is_recurring && (
                          <span className="text-xs bg-purple-50 text-purple-600 rounded px-1.5 py-0.5 flex items-center gap-1">
                            <RefreshCw size={10} /> Recurring
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 flex-shrink-0">
                    ${Number(e.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
