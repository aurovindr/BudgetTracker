"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CATEGORY_COLORS, Category } from "@/lib/constants";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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

  const selectedColor = category ? (CATEGORY_COLORS[category as Category] ?? "#94a3b8") : "#94a3b8";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[95vh] overflow-y-auto p-0">
        {/* Coloured header */}
        <div
          className="px-5 pt-5 pb-4 rounded-t-3xl"
          style={{ background: `linear-gradient(135deg, ${selectedColor}cc, ${selectedColor}88)` }}
        >
          <SheetHeader>
            <SheetTitle className="text-white text-lg font-bold text-left">
              {category ? `${CATEGORY_EMOJI[category] ?? "📦"} ${category}` : "Add Expense"}
            </SheetTitle>
          </SheetHeader>
          {amount && (
            <p className="text-white/90 text-3xl font-bold mt-1">${parseFloat(amount || "0").toFixed(2)}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                required className="rounded-xl h-11 border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount ($)</Label>
              <Input type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="0.00"
                value={amount} onChange={(e) => setAmount(e.target.value)}
                required className="rounded-xl h-11 border-gray-200 font-semibold" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</Label>
            <Input placeholder="e.g. Weekly groceries" value={description}
              onChange={(e) => setDescription(e.target.value)} required
              className="rounded-xl h-11 border-gray-200" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
              <SelectTrigger className="rounded-xl h-11 border-gray-200">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-2">
                      <span>{CATEGORY_EMOJI[c]}</span>
                      <span>{c}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Paid By</Label>
            <div className="h-11 rounded-xl border border-gray-200 bg-gray-50 flex items-center px-3 text-sm text-gray-500">
              {memberName} (you)
            </div>
          </div>

          {/* Toggles */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-gray-700">Split equally</p>
                <p className="text-xs text-gray-400">Divide among all members</p>
              </div>
              <Checkbox checked={isSplit} onCheckedChange={(v) => setIsSplit(!!v)}
                className="w-5 h-5 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600" />
            </label>
            <Separator />
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-gray-700">Recurring monthly</p>
                <p className="text-xs text-gray-400">Repeats every month</p>
              </div>
              <Checkbox checked={isRecurring} onCheckedChange={(v) => setIsRecurring(!!v)}
                className="w-5 h-5 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500" />
            </label>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full h-13 py-3.5 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200 disabled:opacity-60 transition-all">
            {loading ? "Saving…" : "Save Expense"}
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Separator() {
  return <div className="h-px bg-gray-200" />;
}
