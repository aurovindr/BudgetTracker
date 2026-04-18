import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("full_name, email, created_at")
    .eq("id", user.id)
    .single();

  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount, paid_by, is_split")
    .gte("date", from)
    .lte("date", to);

  const { data: members } = await supabase.from("members").select("id");
  const memberCount = members?.length || 1;

  const totalPaid = (expenses ?? [])
    .filter((e) => e.paid_by === user.id)
    .reduce((s, e) => s + Number(e.amount), 0);

  const myShare = (expenses ?? [])
    .filter((e) => e.is_split)
    .reduce((s, e) => s + Number(e.amount) / memberCount, 0);

  const balance = totalPaid - myShare;

  return (
    <AppShell memberId={user.id} memberName={member?.full_name ?? "Member"}>
      <ProfileClient
        memberId={user.id}
        fullName={member?.full_name ?? "Member"}
        email={member?.email ?? user.email ?? ""}
        totalPaid={totalPaid}
        myShare={myShare}
        balance={balance}
      />
    </AppShell>
  );
}
