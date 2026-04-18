"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (pin.length !== 4) { setError("PIN must be exactly 4 digits."); return; }
    if (pin !== confirmPin) { setError("PINs do not match."); return; }
    setLoading(true);
    const supabase = createClient();
    const password = pin + pin.split("").reverse().join("") + pin.slice(0, 2);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 px-4 py-8">
      {/* Logo */}
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur">
          <span className="text-3xl">💰</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">BudgetTracker</h1>
        <p className="text-white/70 text-sm mt-1">Join your household</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Create account</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-gray-600 font-medium text-sm">Full Name</Label>
            <Input
              id="fullName" type="text" placeholder="Jane Smith"
              value={fullName} onChange={(e) => setFullName(e.target.value)}
              required autoComplete="name"
              className="rounded-xl border-gray-200 focus:border-violet-400 h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-gray-600 font-medium text-sm">Email</Label>
            <Input
              id="email" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email"
              className="rounded-xl border-gray-200 focus:border-violet-400 h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pin" className="text-gray-600 font-medium text-sm">4-Digit PIN</Label>
            <Input
              id="pin" type="password" inputMode="numeric" maxLength={4} placeholder="••••"
              value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              required
              className="rounded-xl border-gray-200 focus:border-violet-400 h-11 text-center text-xl tracking-[0.5em]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPin" className="text-gray-600 font-medium text-sm">Confirm PIN</Label>
            <Input
              id="confirmPin" type="password" inputMode="numeric" maxLength={4} placeholder="••••"
              value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              required
              className="rounded-xl border-gray-200 focus:border-violet-400 h-11 text-center text-xl tracking-[0.5em]"
            />
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2">{error}</div>
          )}
          <button
            type="submit" disabled={loading}
            className="w-full h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 mt-2"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
