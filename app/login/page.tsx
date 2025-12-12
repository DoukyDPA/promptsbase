"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setErrorMsg("Identifiants incorrects. Vérifiez votre email et votre mot de passe.");
      return;
    }
    router.push("/prompts");
    router.refresh();
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Connexion</h1>

      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border p-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Mot de passe</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

        <button
          disabled={loading}
          className="w-full rounded-md border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <div className="text-sm">
          <Link href="/reset-password" className="underline underline-offset-4">
            Mot de passe oublié ?
          </Link>
        </div>
      </form>

      <p className="text-sm text-slate-700">
        Accès réservé : si vous n’avez pas été invité, vous ne pourrez pas accéder au contenu.
      </p>
    </div>
  );
}
