"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, List, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onAddClick: () => void;
}

export default function BottomNav({ onAddClick }: BottomNavProps) {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    cn(
      "flex flex-col items-center gap-0.5 text-xs px-4 py-2 transition-colors",
      pathname === href ? "text-brand" : "text-gray-400"
    );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-t border-gray-100 shadow-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        <Link href="/dashboard" className={linkClass("/dashboard")}>
          <Home size={22} strokeWidth={pathname === "/dashboard" ? 2.5 : 1.8} />
          <span className={pathname === "/dashboard" ? "font-semibold" : ""}>Home</span>
        </Link>

        <Link href="/expenses" className={linkClass("/expenses")}>
          <List size={22} strokeWidth={pathname === "/expenses" ? 2.5 : 1.8} />
          <span className={pathname === "/expenses" ? "font-semibold" : ""}>Expenses</span>
        </Link>

        {/* Add button — elevated pill */}
        <button
          onClick={onAddClick}
          className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-brand text-white shadow-lg shadow-brand-light -mt-5"
        >
          <PlusCircle size={26} strokeWidth={2} />
        </button>

        <Link href="/profile" className={linkClass("/profile")}>
          <User size={22} strokeWidth={pathname === "/profile" ? 2.5 : 1.8} />
          <span className={pathname === "/profile" ? "font-semibold" : ""}>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
