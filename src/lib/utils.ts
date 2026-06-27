import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// The app authenticates by name + PIN (no email collected from the user).
// Supabase Auth still requires an email under the hood, so we derive a stable,
// internal-only address from the member's name. Same name → same address, which
// is what lets login find the right account.
export function nameToEmail(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return `${slug || "member"}@budget.local`;
}
