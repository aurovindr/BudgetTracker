"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LogOut, KeyRound, TrendingUp, Wallet, Scale } from "lucide-react";

interface Props {
  memberId: string;
  fullName: string;
  email: string;
  totalPaid: number;
  myShare: number;
  balance: number;
}

export default function ProfileClient({ fullName, email, totalPaid, myShare, balance }: Props) {
  const router = useRouter();
  const [changingPin, setChangingPin] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const initials = fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleChangePin(e: React.FormEvent) {
    e.preventDefault();
    setPinError(""); setPinSuccess("");
    if (newPin.length !== 4) { setPinError("New PIN must be 4 digits."); return; }
    if (newPin !== confirmPin) { setPinError("PINs do not match."); return; }
    setLoading(true);
    const supabase = createClient();
    const padPin = (p: string) => p + p.split("").reverse().join("") + p.slice(0, 2);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: padPin(currentPin) });
    if (signInError) { setPinError("Current PIN is incorrect."); setLoading(false); return; }
    const { error } = await supabase.auth.updateUser({ password: padPin(newPin) });
    if (error) { setPinError("Failed to update PIN."); }
    else {
      setPinSuccess("PIN updated successfully.");
      setCurrentPin(""); setNewPin(""); setConfirmPin(""); setChangingPin(false);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* Gradient Header with Avatar */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 px-5 pt-8 pb-8 rounded-b-3xl shadow-lg flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center mb-3 shadow-inner">
          <span className="text-3xl font-bold text-white">{initials}</span>
        </div>
        <h1 className="text-xl font-bold text-white">{fullName}</h1>
        <p className="text-white/70 text-sm mt-0.5">{email}</p>
      </div>

      <div className="px-4 space-y-4">
        {/* This Month Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full" />
            <h2 className="text-sm font-bold text-gray-700">This Month</h2>
          </div>
          <div className="px-4 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Wallet size={14} className="text-blue-600" />
                </div>
                Total Paid
              </div>
              <span className="font-bold text-gray-800">₹{totalPaid.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                  <TrendingUp size={14} className="text-violet-600" />
                </div>
                Your Share
              </div>
              <span className="font-bold text-gray-800">₹{myShare.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${balance >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                  <Scale size={14} className={balance >= 0 ? "text-green-600" : "text-red-500"} />
                </div>
                Balance
              </div>
              <span className={`font-bold text-lg ${balance >= 0 ? "text-green-600" : "text-red-500"}`}>
                {balance >= 0 ? "+" : ""}₹{balance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Change PIN */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-4">
            {!changingPin ? (
              <button
                onClick={() => setChangingPin(true)}
                className="flex items-center gap-3 w-full"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <KeyRound size={16} className="text-indigo-600" />
                </div>
                <span className="text-sm font-semibold text-indigo-600">Change PIN</span>
              </button>
            ) : (
              <form onSubmit={handleChangePin} className="space-y-3">
                <p className="text-sm font-bold text-gray-700 mb-3">Change PIN</p>
                {[
                  { id: "currentPin", label: "Current PIN", val: currentPin, set: setCurrentPin },
                  { id: "newPin", label: "New PIN", val: newPin, set: setNewPin },
                  { id: "confirmPin2", label: "Confirm New PIN", val: confirmPin, set: setConfirmPin },
                ].map(({ id, label, val, set }) => (
                  <div key={id} className="space-y-1">
                    <Label htmlFor={id} className="text-xs text-gray-500">{label}</Label>
                    <Input id={id} type="password" inputMode="numeric" maxLength={4} placeholder="••••"
                      value={val} onChange={(e) => set(e.target.value.replace(/\D/g, ""))}
                      className="rounded-xl h-11 text-center text-xl tracking-[0.5em]" />
                  </div>
                ))}
                {pinError && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{pinError}</p>}
                {pinSuccess && <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">{pinSuccess}</p>}
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={loading}
                    className="flex-1 h-10 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-60">
                    {loading ? "Saving…" : "Update PIN"}
                  </button>
                  <Button type="button" variant="outline" size="sm" className="flex-1 rounded-xl h-10"
                    onClick={() => { setChangingPin(false); setPinError(""); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full h-12 rounded-2xl border-2 border-rose-200 text-rose-500 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}
