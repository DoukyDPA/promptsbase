import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Bienvenue</h1>
      <p className="text-slate-700">
        Cet outil permet de partager des prompts et de proposer des améliorations avec historique.
      </p>
      <Link
        href="/prompts"
        className="inline-block rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
      >
        Accéder aux prompts
      </Link>
    </div>
  );
}