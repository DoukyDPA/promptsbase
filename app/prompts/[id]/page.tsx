import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth/requireMember";
import { mergeProposal } from "@/actions/prompts";

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { member } = await requireMember();
  const supabase = supabaseServer();
  const { id } = await params;
  const promptId = id;

  const { data: prompt, error: pErr } = await supabase
    .from("prompts")
    .select("id,title,situation,objective,audience,maturity,current_version_id")
    .eq("id", promptId)
    .single();
  if (pErr) throw pErr;

  const { data: currentVersion, error: vErr } = await supabase
    .from("prompt_versions")
    .select("id,version_number,content,created_at")
    .eq("id", prompt.current_version_id)
    .single();
  if (vErr) throw vErr;

  const { data: proposals, error: prErr } = await supabase
    .from("proposals")
    .select("id,status,created_at,rationale,proposed_content")
    .eq("prompt_id", promptId)
    .order("created_at", { ascending: false });
  if (prErr) throw prErr;

  async function onMerge(formData: FormData) {
    "use server";
    const proposalId = String(formData.get("proposalId"));
    await mergeProposal(promptId, proposalId);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{prompt.title}</h1>
          <div className="text-sm text-slate-700">{prompt.situation}</div>
          <div className="text-sm text-slate-700"><span className="font-medium">Objectif :</span> {prompt.objective}</div>
          <div className="text-sm text-slate-700"><span className="font-medium">Public :</span> {prompt.audience}</div>
        </div>

        <Link
          href={`/prompts/${promptId}/propose`}
          className="shrink-0 rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
        >
          Proposer une amélioration
        </Link>
      </div>

      <section className="space-y-2 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Version actuelle</h2>
          <div className="text-xs text-slate-600">v{currentVersion.version_number}</div>
        </div>
        <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm">{currentVersion.content}</pre>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Propositions</h2>

        {(!proposals || proposals.length === 0) && (
          <p className="text-sm text-slate-700">Aucune proposition pour le moment.</p>
        )}

        <div className="space-y-3">
          {proposals?.map((pr) => (
            <div key={pr.id} className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm">
                  <span className="font-medium">Statut :</span>{" "}
                  {pr.status === "open" ? "Proposition ouverte" : pr.status === "merged" ? "Fusionnée" : "Fermée"}
                </div>
                {member.role === "admin" && pr.status === "open" && (
                  <form action={onMerge}>
                    <input type="hidden" name="proposalId" value={pr.id} />
                    <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50">
                      Fusionner et publier
                    </button>
                  </form>
                )}
              </div>

              {pr.rationale && (
                <div className="text-sm text-slate-700">
                  <span className="font-medium">Justification :</span> {pr.rationale}
                </div>
              )}

              <details className="rounded-md bg-slate-50 p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  Voir la proposition
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-sm">{pr.proposed_content}</pre>
              </details>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}