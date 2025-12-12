"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireMember } from "@/lib/auth/requireMember";

export async function createPrompt(formData: FormData) {
  const { userId } = await requireMember();
  const supabase = supabaseServer();

  const title = String(formData.get("title") || "").trim();
  const situation = String(formData.get("situation") || "").trim();
  const objective = String(formData.get("objective") || "").trim();
  const audience = String(formData.get("audience") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!title || !situation || !objective || !audience || !content) {
    throw new Error("Tous les champs sont obligatoires.");
  }

  // 1) prompt
  const { data: prompt, error: e1 } = await supabase
    .from("prompts")
    .insert({
      title,
      situation,
      objective,
      audience,
      created_by: userId,
      maturity: "draft",
    })
    .select("id")
    .single();

  if (e1) throw e1;

  // 2) version 1
  const { data: v1, error: e2 } = await supabase
    .from("prompt_versions")
    .insert({
      prompt_id: prompt.id,
      version_number: 1,
      content,
      rationale: "Version initiale",
      created_by: userId,
    })
    .select("id")
    .single();

  if (e2) throw e2;

  // 3) set current_version_id
  const { error: e3 } = await supabase
    .from("prompts")
    .update({ current_version_id: v1.id })
    .eq("id", prompt.id);

  if (e3) throw e3;

  revalidatePath("/prompts");
  return prompt.id as string;
}

export async function createProposal(promptId: string, baseVersionId: string, formData: FormData) {
  const { userId } = await requireMember();
  const supabase = supabaseServer();

  const proposed_content = String(formData.get("proposed_content") || "").trim();
  const rationale = String(formData.get("rationale") || "").trim();

  if (!proposed_content) throw new Error("La proposition ne peut pas être vide.");

  const { error } = await supabase.from("proposals").insert({
    prompt_id: promptId,
    base_version_id: baseVersionId,
    proposed_content,
    rationale: rationale || null,
    status: "open",
    created_by: userId,
  });

  if (error) throw error;

  revalidatePath(`/prompts/${promptId}`);
}

export async function mergeProposal(promptId: string, proposalId: string) {
  const { member } = await requireMember();
  if (member.role !== "admin") {
    throw new Error("Action non autorisée.");
  }

  // Service role pour faire une transaction “propre”
  const admin = supabaseAdmin();

  // Charger la proposition + base version
  const { data: proposal, error: pErr } = await admin
    .from("proposals")
    .select("id,prompt_id,base_version_id,proposed_content,status")
    .eq("id", proposalId)
    .single();

  if (pErr) throw pErr;
  if (proposal.status !== "open") throw new Error("Cette proposition n’est plus ouverte.");

  // Récupérer le max version_number
  const { data: maxV, error: mErr } = await admin
    .from("prompt_versions")
    .select("version_number")
    .eq("prompt_id", promptId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (mErr) throw mErr;
  const nextVersion = (maxV?.version_number ?? 0) + 1;

  // Créer nouvelle version
  const { data: newV, error: vErr } = await admin
    .from("prompt_versions")
    .insert({
      prompt_id: promptId,
      version_number: nextVersion,
      content: proposal.proposed_content,
      rationale: "Fusion d’une proposition",
      created_by: member.user_id, // admin qui fusionne
    })
    .select("id")
    .single();

  if (vErr) throw vErr;

  // Mettre current_version_id
  const { error: uErr } = await admin
    .from("prompts")
    .update({ current_version_id: newV.id, updated_at: new Date().toISOString() })
    .eq("id", promptId);

  if (uErr) throw uErr;

  // Passer la proposition en merged
  const { error: sErr } = await admin
    .from("proposals")
    .update({ status: "merged", updated_at: new Date().toISOString() })
    .eq("id", proposalId);

  if (sErr) throw sErr;

  revalidatePath(`/prompts/${promptId}`);
}