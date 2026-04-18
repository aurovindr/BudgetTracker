"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, TrendingUp, Wallet, Users, AlertCircle } from "lucide-react";
import CategoryChart from "@/components/dashboard/CategoryChart";
import MemberPaymentChart from "@/components/dashboard/MemberPaymentChart";
import TrendChart from "@/components/dashboard/TrendChart";

interface Props {
  memberName: string;
  year: number;
  month: number;
  totalSpent: number;
  myPaid: number;
  myShare: number;
  pendingSettlement: number;
  categoryData: { name: string; value: number }[];
  memberData: { name: string; paid: number }[];
  trendData: { month: string; total: number }[];
  settlements: { from: string; to: string; amount: number }[];
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function DashboardClient({
  memberName, year, month, totalSpent, myPaid, myShare,
  pendingSettlement, categoryData, memberData, trendData, settlements,
}: Props) {
  const router = useRouter();
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const minDate = new Date();
  minDate.setMonth(minDate.getMonth() - 5);
  minDate.setDate(1);
  const isMinMonth = year < minDate.getFullYear() ||
    (year === minDate.getFullYear() && month <= minDate.getMonth() + 1);

  function navigate(dir: -1 | 1) {
    const d = new Date(year, month - 1 + dir);
    router.push(`/dashboard?year=${d.getFullYear()}&month=${d.getMonth() + 1}`);
  }

  const firstName = memberName.split(" ")[0];

  return (
    <div className="space-y-4">
      {/* Gradient Header */}
      <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 px-5 pt-8 pb-6 rounded-b-3xl shadow-lg">
        <p className="text-white/70 text-sm mb-0.5">Good day,</p>
        <h1 className="text-2xl font-bold text-white mb-4">{firstName} 👋</h1>

        {/* Month Nav inside header */}
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

      <div className="px-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-4 text-white shadow-md shadow-violet-200">
            <div className="flex items-center gap-1.5 mb-2 opacity-80">
              <Wallet size={14} />
              <p className="text-xs font-medium">Total Spent</p>
            </div>
            <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 text-white shadow-md shadow-blue-200">
            <div className="flex items-center gap-1.5 mb-2 opacity-80">
              <TrendingUp size={14} />
              <p className="text-xs font-medium">You Paid</p>
            </div>
            <p className="text-2xl font-bold">${myPaid.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-4 text-white shadow-md shadow-emerald-200">
            <div className="flex items-center gap-1.5 mb-2 opacity-80">
              <Users size={14} />
              <p className="text-xs font-medium">Your Share</p>
            </div>
            <p className="text-2xl font-bold">${myShare.toFixed(2)}</p>
          </div>

          <div className={`rounded-2xl p-4 text-white shadow-md ${
            pendingSettlement > 0
              ? "bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-200"
              : "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-200"
          }`}>
            <div className="flex items-center gap-1.5 mb-2 opacity-80">
              <AlertCircle size={14} />
              <p className="text-xs font-medium">You Owe</p>
            </div>
            <p className="text-2xl font-bold">${pendingSettlement.toFixed(2)}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-1 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full" />
            <h2 className="text-sm font-bold text-gray-700">Spending by Category</h2>
          </div>
          <CategoryChart data={categoryData} />
        </div>

        {/* Payment by Member */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-1 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
            <h2 className="text-sm font-bold text-gray-700">Payment by Member</h2>
          </div>
          <div className="px-2 pb-2">
            <MemberPaymentChart data={memberData} />
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-1 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
            <h2 className="text-sm font-bold text-gray-700">6-Month Trend</h2>
          </div>
          <div className="px-2 pb-2">
            <TrendChart data={trendData} />
          </div>
        </div>

        {/* Settlements */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-2">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full" />
            <h2 className="text-sm font-bold text-gray-700">Settlements — {MONTH_NAMES[month - 1]}</h2>
          </div>
          {settlements.length === 0 ? (
            <div className="px-4 pb-4 flex items-center gap-2 text-emerald-600">
              <span className="text-lg">✅</span>
              <p className="text-sm font-medium">All settled up!</p>
            </div>
          ) : (
            <ul className="px-4 pb-4 space-y-2">
              {settlements.map((s, i) => (
                <li key={i} className="flex items-center justify-between bg-rose-50 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-rose-600">{s.from}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-semibold text-emerald-600">{s.to}</span>
                  </div>
                  <span className="font-bold text-gray-800 text-sm">${s.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
