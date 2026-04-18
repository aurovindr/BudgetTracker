"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length !== 4) { setError("PIN must be 4 digits."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const password = pin + pin.split("").reverse().join("") + pin.slice(0, 2);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Invalid email or PIN. Please try again.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 px-4">
      {/* Logo area */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur">
          <span className="text-3xl">💰</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">BudgetTracker</h1>
        <p className="text-white/70 text-sm mt-1">Track expenses together</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Welcome back</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-gray-600 font-medium text-sm">Email</Label>
            <Input
              id="email" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email"
              className="rounded-xl border-gray-200 focus:border-violet-400 focus:ring-violet-400 h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pin" className="text-gray-600 font-medium text-sm">4-Digit PIN</Label>
            <Input
              id="pin" type="password" inputMode="numeric" maxLength={4} placeholder="••••"
              value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              required
              className="rounded-xl border-gray-200 focus:border-violet-400 focus:ring-violet-400 h-11 text-center text-xl tracking-[0.5em]"
            />
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-200 disabled:opacity-60 mt-2"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-5">
          No account?{" "}
          <Link href="/register" className="text-violet-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}
