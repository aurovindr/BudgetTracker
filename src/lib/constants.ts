export const CATEGORIES = [
  "Groceries",
  "Utilities",
  "Rent",
  "Dining",
  "Transport",
  "Healthcare",
  "Entertainment",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  Groceries: "#4ade80",
  Utilities: "#60a5fa",
  Rent: "#f97316",
  Dining: "#a78bfa",
  Transport: "#facc15",
  Healthcare: "#f472b6",
  Entertainment: "#34d399",
  Other: "#94a3b8",
};
