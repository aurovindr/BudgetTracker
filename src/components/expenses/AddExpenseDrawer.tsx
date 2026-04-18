"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, Edit2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CATEGORY_COLORS, Category } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
type Step = "fill" | "review" | "success";

export default function AddExpenseDrawer({ open, onOpenChange, memberId, memberName }: AddExpenseDrawerProps) {
  const [step, setStep] = useState<Step>("fill");
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [isSplit, setIsSplit] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberCount, setMemberCount] = useState(1);

  useEffect(() => {
    if (open && step === "review") {
      createClient().from("members").select("id").then(({ data }) => {
        if (data) setMemberCount(data.length);
      });
    }
  }, [open, step]);

  function reset() {
    setDate(today()); setDescription(""); setCategory(""); setAmount("");
    setIsSplit(false); setIsRecurring(false); setError(""); setStep("fill");
  }

  function handleClose() { reset(); onOpenChange(false); }

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!date || !description || !category || !amount) { setError("All fields are required."); return; }
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) { setError("Enter a valid amount."); return; }
    setStep("review");
  }

  async function handleConfirm() {
    setLoading(true);
    const supabase = createClient();
    const parsedAmount = parseFloat(amount);

    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .insert({ description, category, amount: parsedAmount, date, paid_by: memberId, is_split: isSplit, is_recurring: isRecurring })
      .select().single();

    if (expenseError) { setError("Failed to save. Please try again."); setStep("fill"); setLoading(false); return; }

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
    setStep("success");
    setTimeout(() => { reset(); onOpenChange(false); }, 1800);
  }

  const accentColor = category ? (CATEGORY_COLORS[category as Category] ?? "#6d28d9") : "#6d28d9";
  const parsedAmount = parseFloat(amount || "0");
  const splitShare = isSplit && memberCount > 1
    ? (parsedAmount / memberCount).toLocaleString("en-IN", { minimumFractionDigits: 2 })
    : null;

  const formattedDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";

  if (!open) return null;

  // ─── Success screen ───────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
          style={{ backgroundColor: accentColor + "22" }}
        >
          <CheckCircle2 size={52} style={{ color: accentColor }} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Expense Saved!</h2>
        <p className="text-gray-400 text-base">
          ₹{parsedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} · {category}
        </p>
        {isSplit && (
          <p className="text-sm text-gray-400 mt-1">Split among {memberCount} members</p>
        )}
      </div>
    );
  }

  // ─── Review screen ────────────────────────────────────────────────
  if (step === "review") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-white">
        <div
          className="px-5 pt-12 pb-6"
          style={{ background: `linear-gradient(135deg, ${accentColor}dd, ${accentColor}88)` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-1">Review Expense</p>
              <p className="text-4xl font-bold text-white">
                ₹{parsedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <button onClick={handleClose} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white mt-1">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 px-5 py-5 space-y-3 overflow-y-auto">
          {[
            { label: "Description", value: description },
            { label: "Category", value: `${CATEGORY_EMOJI[category] ?? ""} ${category}` },
            { label: "Date", value: formattedDate },
            { label: "Paid By", value: `${memberName} (you)` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3.5">
              <span className="text-sm text-gray-400 font-medium">{label}</span>
              <span className="text-base font-semibold text-gray-800">{value}</span>
            </div>
          ))}

          {isSplit && splitShare && (
            <div className="bg-violet-50 rounded-2xl px-4 py-3.5 border border-violet-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-violet-500 font-medium">Split among {memberCount}</span>
                <span className="text-base font-bold text-violet-700">₹{splitShare} each</span>
              </div>
            </div>
          )}

          {isRecurring && (
            <div className="bg-amber-50 rounded-2xl px-4 py-3.5 border border-amber-100">
              <span className="text-sm text-amber-600 font-medium">🔁 Recurring monthly</span>
            </div>
          )}
        </div>

        <div className="px-5 pb-8 space-y-3">
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
          <button
            onClick={handleConfirm} disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }}
          >
            <CheckCircle2 size={22} />
            {loading ? "Saving…" : "Confirm & Save"}
          </button>
          <button
            onClick={() => setStep("fill")}
            className="w-full py-3.5 rounded-2xl font-semibold text-gray-600 bg-gray-100 flex items-center justify-center gap-2 text-base"
          >
            <Edit2 size={16} /> Edit details
          </button>
        </div>
      </div>
    );
  }

  // ─── Fill screen ─────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div
        className="px-5 pt-12 pb-5"
        style={{ background: `linear-gradient(135deg, ${accentColor}dd, ${accentColor}99)` }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-0.5">New Expense</p>
            <h2 className="text-xl font-bold text-white">
              {category ? `${CATEGORY_EMOJI[category]} ${category}` : "Add Expense"}
            </h2>
            {amount && parsedAmount > 0 && (
              <p className="text-white text-3xl font-bold mt-1">
                ₹{parsedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
          <button onClick={handleClose} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white mt-1">
            <X size={18} />
          </button>
        </div>
      </div>

      <form onSubmit={handleReview} className="flex flex-col flex-1 px-5 py-5 space-y-4 overflow-hidden justify-between">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                required className="rounded-xl h-12 border-gray-200 text-base" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Amount (₹)</Label>
              <Input type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="0.00"
                value={amount} onChange={(e) => setAmount(e.target.value)}
                required className="rounded-xl h-12 border-gray-200 font-bold text-base" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</Label>
              <Input placeholder="e.g. Groceries" value={description}
                onChange={(e) => setDescription(e.target.value)} required
                className="rounded-xl h-12 border-gray-200 text-base" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
                <SelectTrigger className="rounded-xl h-12 border-gray-200 text-base">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      <span className="flex items-center gap-2 text-base">
                        <span>{CATEGORY_EMOJI[c]}</span><span>{c}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
              style={{ backgroundColor: accentColor }}>
              {memberName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Paid By</p>
              <p className="text-base font-semibold text-gray-700">{memberName} (you)</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl divide-y divide-gray-200">
            <label className="flex items-center justify-between px-4 py-3.5 cursor-pointer">
              <div>
                <p className="text-base font-semibold text-gray-700">Split equally</p>
                <p className="text-sm text-gray-400">Divide among all members</p>
              </div>
              <Checkbox checked={isSplit} onCheckedChange={(v) => setIsSplit(!!v)}
                className="w-5 h-5 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600" />
            </label>
            <label className="flex items-center justify-between px-4 py-3.5 cursor-pointer">
              <div>
                <p className="text-base font-semibold text-gray-700">Recurring monthly</p>
                <p className="text-sm text-gray-400">Repeats every month</p>
              </div>
              <Checkbox checked={isRecurring} onCheckedChange={(v) => setIsRecurring(!!v)}
                className="w-5 h-5 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500" />
            </label>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
        </div>

        <button type="submit"
          className="w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }}
        >
          Review & Save <ChevronRight size={20} />
        </button>
      </form>
    </div>
  );
}
