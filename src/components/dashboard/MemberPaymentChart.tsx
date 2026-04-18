"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#60a5fa", "#4ade80", "#f97316", "#a78bfa", "#facc15", "#f472b6"];

interface Props {
  data: { name: string; paid: number }[];
}

export default function MemberPaymentChart({ data }: Props) {
  if (data.every((d) => d.paid === 0)) {
    return <p className="text-sm text-gray-400 text-center py-8">No payments this month.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
        <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
        <Bar dataKey="paid" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
