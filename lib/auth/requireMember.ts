import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export type Member = {
  user_id: string;
  email: string;
  role: "member" | "moderator" | "admin";
  org: string | null;
};

export async function requireMember(): Promise<{ userId: string; member: Member }> {
  const supabase = supabaseServer();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: member, error } = await supabase
    .from("members")
    .select("user_id,email,role,org")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !member) redirect("/access-reserved");

  return { userId: user.id, member: member as Member };
}