"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { CATEGORY_COLORS, CATEGORIES, Category } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  paid_by: string;
  is_split: boolean;
  is_recurring: boolean;
  paid_by_member: { full_name: string } | null;
}

interface Props {
  expenses: Expense[];
  year: number;
  month: number;
  currentMemberId: string;
}

type TypeFilter = "all" | "mine" | "personal" | "shared";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const CATEGORY_EMOJI: Record<string, string> = {
  Groceries: "🛒", Utilities: "⚡", Rent: "🏠", Dining: "🍽",
  Transport: "🚗", Healthcare: "💊", Entertainment: "🎬", Other: "📦",
};

const TYPE_OPTIONS: { value: TypeFilter; label: string; desc: string }[] = [
  { value: "all",      label: "All",      desc: "Every expense this month" },
  { value: "mine",     label: "Mine",     desc: "Paid by me (split or not)" },
  { value: "personal", label: "Personal", desc: "Paid by me, not split" },
  { value: "shared",   label: "Shared",   desc: "Split among members" },
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
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

export default function ExpensesClient({ expenses, year, month, currentMemberId }: Props) {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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

  // Count active filters
  const activeFilterCount = (typeFilter !== "all" ? 1 : 0) + (categoryFilter !== "all" ? 1 : 0);

  // Apply filters
  const filtered = expenses.filter((e) => {
    const typeOk =
      typeFilter === "all" ? true :
      typeFilter === "mine" ? e.paid_by === currentMemberId :
      typeFilter === "personal" ? e.paid_by === currentMemberId && !e.is_split :
      typeFilter === "shared" ? e.is_split : true;
    const catOk = categoryFilter === "all" || e.category === categoryFilter;
    return typeOk && catOk;
  });

  const totalFiltered = filtered.reduce((s, e) => s + Number(e.amount), 0);
  const grouped = groupByDate(filtered);
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  function clearFilters() {
    setTypeFilter("all");
    setCategoryFilter("all");
  }

  return (
    <div className="space-y-4">
      {/* Gradient Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 px-5 pt-8 pb-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-0.5">Expenses</h1>
        <p className="text-white/80 text-base font-medium mb-4">
          ₹{totalFiltered.toLocaleString("en-IN", { minimumFractionDigits: 2 })} total
          {activeFilterCount > 0 && " (filtered)"}
        </p>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1 px-1">Type</p>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
            <SelectTrigger className="bg-white/20 border-0 text-white rounded-xl h-10 text-sm font-semibold [&>svg]:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-sm">{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>

          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1 px-1">Category</p>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
            <SelectTrigger className="bg-white/20 border-0 text-white rounded-xl h-10 text-sm font-semibold [&>svg]:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="text-sm">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="text-sm">
                  {CATEGORY_EMOJI[c]} {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white/15 backdrop-blur rounded-2xl px-4 py-2.5">
          <button onClick={() => navigate(-1)} disabled={isMinMonth} className="text-white disabled:opacity-30">
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-white text-sm">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button onClick={() => navigate(1)} disabled={isCurrentMonth} className="text-white disabled:opacity-30">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Expense list */}
      <div className="px-4 space-y-4 pb-2">
        {dates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">{activeFilterCount > 0 ? "🔍" : "🧾"}</p>
            <p className="text-gray-500 font-medium">
              {activeFilterCount > 0 ? "No expenses match your filters" : "No expenses this month"}
            </p>
            {activeFilterCount > 0 ? (
              <button onClick={clearFilters} className="mt-3 text-blue-500 font-semibold text-sm">
                Clear filters
              </button>
            ) : (
              <p className="text-gray-400 text-sm mt-1">Tap + to add one</p>
            )}
          </div>
        ) : (
          dates.map((date) => (
            <div key={date}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                {formatDate(date)}
              </p>
              <div className="space-y-2">
                {grouped[date].map((e) => {
                  const color = CATEGORY_COLORS[e.category as Category] ?? "#94a3b8";
                  return (
                    <div
                      key={e.id}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden flex"
                      style={{ borderLeft: `5px solid ${color}` }}
                    >
                      <div className="flex items-center justify-between gap-3 flex-1 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{ backgroundColor: color + "22" }}
                          >
                            {CATEGORY_EMOJI[e.category] ?? "📦"}
                          </div>
                          <div>
                            <p className="text-base font-bold text-gray-800 leading-tight">{e.description}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[10px] font-bold rounded-full px-2 py-0.5"
                                style={{ backgroundColor: color + "22", color }}>
                                {e.category}
                              </span>
                              <span className="text-[10px] text-gray-400">{e.paid_by_member?.full_name ?? "—"}</span>
                              {e.is_split && (
                                <span className="text-[10px] bg-violet-100 text-violet-600 font-medium rounded-full px-2 py-0.5">Split</span>
                              )}
                              {e.is_recurring && (
                                <span className="text-[10px] bg-amber-100 text-amber-600 font-medium rounded-full px-2 py-0.5 flex items-center gap-1">
                                  <RefreshCw size={8} /> Recurring
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-lg font-bold flex-shrink-0" style={{ color }}>
                          ₹{Number(e.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
