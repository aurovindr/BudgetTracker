"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  data: { name: string; self: number; shared: number }[];
}

export default function MemberPaymentChart({ data }: Props) {
  if (data.every((d) => d.self === 0 && d.shared === 0)) {
    return <p className="text-sm text-gray-400 text-center py-8">No payments this month.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 56)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
        <XAxis type="number" tickFormatter={(v) => `₹${v}`} tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fontWeight: 600 }} width={64} />
        <Tooltip
          formatter={(v, name) => [`₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, name === "self" ? "Personal" : "Shared"]}
        />
        <Legend
          formatter={(value) => value === "self" ? "Personal" : "Shared"}
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
        />
        <Bar dataKey="self" name="self" stackId="a" fill="#6d28d9" radius={[0, 0, 0, 0]} barSize={20} />
        <Bar dataKey="shared" name="shared" stackId="a" fill="#a78bfa" radius={[0, 6, 6, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
