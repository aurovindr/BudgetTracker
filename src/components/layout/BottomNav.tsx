"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, List, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Expenses", href: "/expenses", icon: List },
  { label: "Profile", href: "/profile", icon: User },
];

interface BottomNavProps {
  onAddClick: () => void;
}

export default function BottomNav({ onAddClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center justify-around h-16 max-w-lg mx-auto">
      <Link
        href="/dashboard"
        className={cn(
          "flex flex-col items-center gap-0.5 text-xs px-4 py-2",
          pathname === "/dashboard" ? "text-blue-600" : "text-gray-500"
        )}
      >
        <Home size={22} />
        <span>Home</span>
      </Link>

      <Link
        href="/expenses"
        className={cn(
          "flex flex-col items-center gap-0.5 text-xs px-4 py-2",
          pathname === "/expenses" ? "text-blue-600" : "text-gray-500"
        )}
      >
        <List size={22} />
        <span>Expenses</span>
      </Link>

      <button
        onClick={onAddClick}
        className="flex flex-col items-center gap-0.5 text-xs px-4 py-2 text-blue-600"
      >
        <PlusCircle size={26} />
        <span>Add</span>
      </button>

      <Link
        href="/profile"
        className={cn(
          "flex flex-col items-center gap-0.5 text-xs px-4 py-2",
          pathname === "/profile" ? "text-blue-600" : "text-gray-500"
        )}
      >
        <User size={22} />
        <span>Profile</span>
      </Link>
    </nav>
  );
}
