"use client";

import { useState } from "react";
import BottomNav from "./BottomNav";
import AddExpenseDrawer from "@/components/expenses/AddExpenseDrawer";

interface AppShellProps {
  children: React.ReactNode;
  memberId: string;
  memberName: string;
}

export default function AppShell({ children, memberId, memberName }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative">
      <main className="pb-20">{children}</main>
      <BottomNav onAddClick={() => setDrawerOpen(true)} />
      <AddExpenseDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        memberId={memberId}
        memberName={memberName}
      />
    </div>
  );
}
