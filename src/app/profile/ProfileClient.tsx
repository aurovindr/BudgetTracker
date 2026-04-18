"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, KeyRound } from "lucide-react";

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
    setPinError("");
    setPinSuccess("");

    if (newPin.length !== 4) { setPinError("New PIN must be 4 digits."); return; }
    if (newPin !== confirmPin) { setPinError("PINs do not match."); return; }

    setLoading(true);
    const supabase = createClient();

    const padPin = (p: string) => p + p.split("").reverse().join("") + p.slice(0, 2);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: padPin(currentPin),
    });

    if (signInError) {
      setPinError("Current PIN is incorrect.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: padPin(newPin) });
    if (error) {
      setPinError("Failed to update PIN.");
    } else {
      setPinSuccess("PIN updated successfully.");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setChangingPin(false);
    }
    setLoading(false);
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold text-gray-800 pt-2">Profile</h1>

      {/* Avatar & Name */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 flex flex-col items-center gap-2">
          <Avatar className="w-16 h-16 text-xl">
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <p className="text-lg font-semibold text-gray-800">{fullName}</p>
          <p className="text-sm text-gray-500">{email}</p>
        </CardContent>
      </Card>

      {/* This Month Stats */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Paid</span>
            <span className="font-semibold">${totalPaid.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Your Share</span>
            <span className="font-semibold">${myShare.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Balance</span>
            <span className={`font-semibold ${balance >= 0 ? "text-green-600" : "text-red-500"}`}>
              {balance >= 0 ? "+" : ""}${balance.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Change PIN */}
      <Card className="shadow-sm">
        <CardContent className="pt-4">
          {!changingPin ? (
            <button
              onClick={() => setChangingPin(true)}
              className="flex items-center gap-2 text-sm text-blue-600 font-medium w-full"
            >
              <KeyRound size={16} /> Change PIN
            </button>
          ) : (
            <form onSubmit={handleChangePin} className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Change PIN</p>
              <div className="space-y-1">
                <Label htmlFor="currentPin">Current PIN</Label>
                <Input id="currentPin" type="password" inputMode="numeric" maxLength={4}
                  placeholder="••••" value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPin">New PIN</Label>
                <Input id="newPin" type="password" inputMode="numeric" maxLength={4}
                  placeholder="••••" value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPin">Confirm New PIN</Label>
                <Input id="confirmPin" type="password" inputMode="numeric" maxLength={4}
                  placeholder="••••" value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))} />
              </div>
              {pinError && <p className="text-xs text-red-500">{pinError}</p>}
              {pinSuccess && <p className="text-xs text-green-600">{pinSuccess}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={loading} className="flex-1">
                  {loading ? "Saving…" : "Update PIN"}
                </Button>
                <Button type="button" size="sm" variant="outline" className="flex-1"
                  onClick={() => { setChangingPin(false); setPinError(""); }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full text-red-500 border-red-200 hover:bg-red-50"
        onClick={handleSignOut}
      >
        <LogOut size={16} className="mr-2" /> Sign Out
      </Button>
    </div>
  );
}
