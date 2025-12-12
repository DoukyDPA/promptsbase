import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth/requireMember";

export default async function PromptsPage() {
  await requireMember();
  const supabase = supabaseServer();

  const { data: prompts, error } = await supabase
    .from("prompts")
    .select("id,title,situation,updated_at,maturity")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Prompts</h1>
        <Link href="/prompts/new" className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50">
          Créer un prompt
        </Link>
      </div>

      <p className="text-sm text-slate-700">
        Rappel : ne saisissez pas de données personnelles (nom, adresse, téléphone, situation identifiable).
      </p>

      <div className="space-y-2">
        {prompts?.map((p) => (
          <Link key={p.id} href={`/prompts/${p.id}`} className="block rounded-lg border p-4 hover:bg-slate-50">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">{p.title}</div>
              <div className="text-xs text-slate-600">{p.maturity}</div>
            </div>
            <div className="mt-1 text-sm text-slate-700 line-clamp-2">{p.situation}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}