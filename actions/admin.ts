"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMember } from "@/lib/auth/requireMember";
import { supabaseAdmin } from "@/lib/supabase/admin";

function assertAdmin(role: string) {
  if (role !== "admin") {
    redirect("/access-reserved");
  }
}

export async function createMissionMember(formData: FormData) {
  const { member } = await requireMember();
  assertAdmin(member.role);

  const mission = String(formData.get("mission") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const roleInput = String(formData.get("role") || "member").trim();
  const allowedRoles = ["member", "moderator", "admin"] as const;
  const role = allowedRoles.includes(roleInput as (typeof allowedRoles)[number])
    ? (roleInput as (typeof allowedRoles)[number])
    : "member";

  if (!mission || !email || !password) {
    throw new Error("La mission locale, l'email et le mot de passe sont obligatoires.");
  }

  const admin = supabaseAdmin();

  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createUserError) {
    throw createUserError;
  }

  const userId = createdUser.user?.id;
  if (!userId) {
    throw new Error("Impossible de récupérer l'identifiant du compte créé.");
  }

  const { error: insertMemberError } = await admin.from("members").insert({
    user_id: userId,
    email,
    role,
    org: mission,
  });

  if (insertMemberError) {
    throw insertMemberError;
  }

  revalidatePath("/admin");
}

export async function updateUserPassword(formData: FormData) {
  const { member } = await requireMember();
  assertAdmin(member.role);

  const userId = String(formData.get("userId") || "").trim();
  const password = String(formData.get("newPassword") || "").trim();

  if (!userId || !password) {
    throw new Error("L'identifiant utilisateur et le nouveau mot de passe sont obligatoires.");
  }

  const admin = supabaseAdmin();
  const { error } = await admin.auth.admin.updateUserById(userId, { password });

  if (error) {
    throw error;
  }

  revalidatePath("/admin");
}
