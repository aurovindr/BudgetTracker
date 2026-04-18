"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CATEGORY_COLORS, Category } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface AddExpenseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  Groceries: "🛒", Utilities: "⚡", Rent: "🏠", Dining: "🍽",
  Transport: "🚗", Healthcare: "💊", Entertainment: "🎬", Other: "📦",
};

const today = () => new Date().toISOString().split("T")[0];

export default function AddExpenseDrawer({ open, onOpenChange, memberId, memberName }: AddExpenseDrawerProps) {
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [isSplit, setIsSplit] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setDate(today()); setDescription(""); setCategory(""); setAmount("");
    setIsSplit(false); setIsRecurring(false); setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!date || !description || !category || !amount) { setError("All fields are required."); return; }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) { setError("Enter a valid amount."); return; }

    setLoading(true);
    const supabase = createClient();
    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .insert({ description, category, amount: parsedAmount, date, paid_by: memberId, is_split: isSplit, is_recurring: isRecurring })
      .select().single();

    if (expenseError) { setError("Failed to save expense. Please try again."); setLoading(false); return; }

    if (isSplit && expense) {
      const { data: members } = await supabase.from("members").select("id");
      if (members && members.length > 0) {
        const splitAmount = parsedAmount / members.length;
        await supabase.from("expense_splits").insert(
          members.map((m) => ({
            expense_id: expense.id, member_id: m.id,
            amount: parseFloat(splitAmount.toFixed(2)),
            is_settled: m.id === memberId,
          }))
        );
      }
    }

    setLoading(false);
    reset();
    onOpenChange(false);
  }

  const accentColor = category ? (CATEGORY_COLORS[category as Category] ?? "#6d28d9") : "#6d28d9";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 pt-12 pb-5"
        style={{ background: `linear-gradient(135deg, ${accentColor}dd, ${accentColor}99)` }}
      >
        <div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-0.5">New Expense</p>
          <h2 className="text-xl font-bold text-white">
            {category ? `${CATEGORY_EMOJI[category]} ${category}` : "Add Expense"}
          </h2>
          {amount && (
            <p className="text-white text-3xl font-bold mt-1">
              ₹{parseFloat(amount || "0").toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>
        <button
          onClick={() => { reset(); onOpenChange(false); }}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 px-5 py-5 space-y-4 overflow-hidden justify-between">
        <div className="space-y-4">
          {/* Date + Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                required className="rounded-xl h-11 border-gray-200 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount (₹)</Label>
              <Input type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="0.00"
                value={amount} onChange={(e) => setAmount(e.target.value)}
                required className="rounded-xl h-11 border-gray-200 font-semibold text-sm" />
            </div>
          </div>

          {/* Description + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</Label>
              <Input placeholder="e.g. Groceries" value={description}
                onChange={(e) => setDescription(e.target.value)} required
                className="rounded-xl h-11 border-gray-200 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
                <SelectTrigger className="rounded-xl h-11 border-gray-200 text-sm">
                  <SelectValue placeholder="Select ▾" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      <span className="flex items-center gap-2">
                        <span>{CATEGORY_EMOJI[c]}</span><span>{c}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Paid By */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              {memberName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Paid By</p>
              <p className="text-sm font-semibold text-gray-700">{memberName} (you)</p>
            </div>
          </div>

          {/* Toggles */}
          <div className="bg-gray-50 rounded-2xl divide-y divide-gray-200">
            <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-gray-700">Split equally</p>
                <p className="text-xs text-gray-400">Divide among all members</p>
              </div>
              <Checkbox checked={isSplit} onCheckedChange={(v) => setIsSplit(!!v)}
                className="w-5 h-5 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600" />
            </label>
            <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-gray-700">Recurring monthly</p>
                <p className="text-xs text-gray-400">Repeats every month</p>
              </div>
              <Checkbox checked={isRecurring} onCheckedChange={(v) => setIsRecurring(!!v)}
                className="w-5 h-5 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500" />
            </label>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
        </div>

        {/* Save Button */}
        <button
          type="submit" disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg disabled:opacity-60 transition-all"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }}
        >
          {loading ? "Saving…" : "Save Expense"}
        </button>
      </form>
    </div>
  );
}
