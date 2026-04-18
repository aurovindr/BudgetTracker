"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/constants";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddExpenseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
}

const today = () => new Date().toISOString().split("T")[0];

export default function AddExpenseDrawer({
  open,
  onOpenChange,
  memberId,
  memberName,
}: AddExpenseDrawerProps) {
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [isSplit, setIsSplit] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setDate(today());
    setDescription("");
    setCategory("");
    setAmount("");
    setIsSplit(false);
    setIsRecurring(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!date || !description || !category || !amount) {
      setError("All fields are required.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .insert({
        description,
        category,
        amount: parsedAmount,
        date,
        paid_by: memberId,
        is_split: isSplit,
        is_recurring: isRecurring,
      })
      .select()
      .single();

    if (expenseError) {
      setError("Failed to save expense. Please try again.");
      setLoading(false);
      return;
    }

    if (isSplit && expense) {
      const { data: members } = await supabase.from("members").select("id");
      if (members && members.length > 0) {
        const splitAmount = parsedAmount / members.length;
        const splits = members.map((m) => ({
          expense_id: expense.id,
          member_id: m.id,
          amount: parseFloat(splitAmount.toFixed(2)),
          is_settled: m.id === memberId,
        }));
        await supabase.from("expense_splits").insert(splits);
      }
    }

    setLoading(false);
    reset();
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[92vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Add Expense</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Weekly groceries"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label>Paid By</Label>
            <Input value={`${memberName} (you)`} disabled />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Checkbox
              id="split"
              checked={isSplit}
              onCheckedChange={(v) => setIsSplit(!!v)}
            />
            <Label htmlFor="split" className="cursor-pointer">
              Split equally among all members
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="recurring"
              checked={isRecurring}
              onCheckedChange={(v) => setIsRecurring(!!v)}
            />
            <Label htmlFor="recurring" className="cursor-pointer">
              Recurring monthly
            </Label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Save Expense"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
