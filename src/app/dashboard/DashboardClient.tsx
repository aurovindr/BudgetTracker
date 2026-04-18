"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, TrendingUp, Wallet, Users, AlertCircle, ArrowLeftRight, UserCheck, BadgeIndianRupee } from "lucide-react";
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
  totalShared: number;
  perHead: number;
  youCovered: number;
  categoryData: { name: string; value: number }[];
  memberData: { name: string; self: number; shared: number }[];
  trendData: { month: string; total: number }[];
  settlements: { from: string; to: string; amount: number }[];
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function DashboardClient({
  memberName, year, month, totalSpent, myPaid, myShare, pendingSettlement,
  totalShared, perHead, youCovered, categoryData, memberData, trendData, settlements,
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
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 px-5 pt-8 pb-6 rounded-b-3xl shadow-lg">
        <p className="text-white/70 text-base mb-0.5">Good day,</p>
        <h1 className="text-3xl font-bold text-white mb-4">{firstName} 👋</h1>
        <div className="flex items-center justify-between bg-white/15 backdrop-blur rounded-2xl px-4 py-2.5">
          <button onClick={() => navigate(-1)} disabled={isMinMonth} className="text-white disabled:opacity-30">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-white text-base">{MONTH_NAMES[month - 1]} {year}</span>
          <button onClick={() => navigate(1)} disabled={isCurrentMonth} className="text-white disabled:opacity-30">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">

        {/* ── Your Summary ── */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Your Summary</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-4 text-white shadow-md shadow-indigo-100">
              <div className="flex items-center gap-1.5 mb-2 opacity-80"><Wallet size={15} /><p className="text-sm font-semibold">Total Spent</p></div>
              <p className="text-2xl font-bold">₹{fmt(totalSpent)}</p>
            </div>
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-4 text-white shadow-md shadow-violet-100">
              <div className="flex items-center gap-1.5 mb-2 opacity-80"><TrendingUp size={15} /><p className="text-sm font-semibold">You Paid</p></div>
              <p className="text-2xl font-bold">₹{fmt(myPaid)}</p>
            </div>
            <div className="bg-gradient-to-br from-slate-600 to-indigo-700 rounded-2xl p-4 text-white shadow-md shadow-slate-200">
              <div className="flex items-center gap-1.5 mb-2 opacity-80"><UserCheck size={15} /><p className="text-sm font-semibold">Your Share</p></div>
              <p className="text-2xl font-bold">₹{fmt(myShare)}</p>
            </div>
            <div className={`rounded-2xl p-4 text-white shadow-md ${
              pendingSettlement > 0
                ? "bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-100"
                : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-100"
            }`}>
              <div className="flex items-center gap-1.5 mb-2 opacity-80"><AlertCircle size={15} /><p className="text-sm font-semibold">You Owe</p></div>
              <p className="text-2xl font-bold">₹{fmt(pendingSettlement)}</p>
            </div>
          </div>
        </div>

        {/* ── Shared Expenses ── */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Shared Expenses</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <ArrowLeftRight size={16} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Total Split</p>
                  <p className="text-xs text-gray-400">All shared expenses this month</p>
                </div>
              </div>
              <p className="text-base font-bold text-gray-800">₹{fmt(totalShared)}</p>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Users size={16} className="text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Per Head</p>
                  <p className="text-xs text-gray-400">Equal share per member</p>
                </div>
              </div>
              <p className="text-base font-bold text-gray-800">₹{fmt(perHead)}</p>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${youCovered >= 0 ? "bg-emerald-100" : "bg-rose-100"}`}>
                  <BadgeIndianRupee size={16} className={youCovered >= 0 ? "text-emerald-600" : "text-rose-500"} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">You Covered</p>
                  <p className="text-xs text-gray-400">{youCovered >= 0 ? "Others owe you" : "You owe others"}</p>
                </div>
              </div>
              <p className={`text-base font-bold ${youCovered >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                {youCovered >= 0 ? "+" : ""}₹{fmt(Math.abs(youCovered))}
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-1 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" />
            <h2 className="text-base font-bold text-gray-700">Spending by Category</h2>
          </div>
          <CategoryChart data={categoryData} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-1 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
            <h2 className="text-base font-bold text-gray-700">Payment by Member</h2>
          </div>
          <div className="px-2 pb-2">
            <MemberPaymentChart data={memberData} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-1 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-indigo-400 to-violet-600 rounded-full" />
            <h2 className="text-base font-bold text-gray-700">6-Month Trend</h2>
          </div>
          <div className="px-2 pb-2">
            <TrendChart data={trendData} />
          </div>
        </div>

        {/* Settlements */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-2">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full" />
            <h2 className="text-base font-bold text-gray-700">Settlements — {MONTH_NAMES[month - 1]}</h2>
          </div>
          {settlements.length === 0 ? (
            <div className="px-4 pb-4 flex items-center gap-2 text-emerald-600">
              <span className="text-xl">✅</span>
              <p className="text-base font-semibold">All settled up!</p>
            </div>
          ) : (
            <ul className="px-4 pb-4 space-y-2">
              {settlements.map((s, i) => (
                <li key={i} className="flex items-center justify-between bg-indigo-50 rounded-xl px-3 py-3">
                  <div className="flex items-center gap-2 text-base">
                    <span className="font-bold text-rose-600">{s.from}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-bold text-emerald-600">{s.to}</span>
                  </div>
                  <span className="font-bold text-indigo-700 text-base">₹{fmt(s.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
