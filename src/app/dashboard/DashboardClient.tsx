"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-lg font-semibold text-gray-800">Hi, {memberName}</h1>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          disabled={isMinMonth}
          className="p-1 disabled:opacity-30"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-medium text-gray-700">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button
          onClick={() => navigate(1)}
          disabled={isCurrentMonth}
          className="p-1 disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Total Spent</p>
            <p className="text-xl font-bold text-gray-800">${totalSpent.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">You Paid</p>
            <p className="text-xl font-bold text-blue-600">${myPaid.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Your Share</p>
            <p className="text-xl font-bold text-gray-800">${myShare.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className={`shadow-sm ${pendingSettlement > 0 ? "border-red-200" : ""}`}>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">You Owe</p>
            <p className={`text-xl font-bold ${pendingSettlement > 0 ? "text-red-500" : "text-green-500"}`}>
              ${pendingSettlement.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-semibold text-gray-700">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryChart data={categoryData} />
        </CardContent>
      </Card>

      {/* Payment by Member */}
      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-semibold text-gray-700">Payment by Member</CardTitle>
        </CardHeader>
        <CardContent>
          <MemberPaymentChart data={memberData} />
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-semibold text-gray-700">Monthly Trend (6 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart data={trendData} />
        </CardContent>
      </Card>

      {/* Settlements */}
      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-semibold text-gray-700">
            Settlements — {MONTH_NAMES[month - 1]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {settlements.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">All settled up!</p>
          ) : (
            <ul className="space-y-2 pt-2">
              {settlements.map((s, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    <span className="font-medium text-red-500">{s.from}</span>
                    {" → "}
                    <span className="font-medium text-green-600">{s.to}</span>
                  </span>
                  <span className="font-semibold">${s.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
