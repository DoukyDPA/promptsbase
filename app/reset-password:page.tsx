"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // redirection vers un écran géré par Supabase, ou vers votre page dédiée.
    // Ici on utilise redirectTo vers /login, Supabase enverra un lien avec token.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setSent(true);
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Réinitialiser votre mot de passe</h1>

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

        <button className="w-full rounded-md border px-3 py-2 text-sm hover:bg-slate-50">
          Envoyer le lien de réinitialisation
        </button>

        {sent && (
          <p className="text-sm text-slate-700">
            Si un compte existe, un email vous a été envoyé.
          </p>
        )}
      </form>
    </div>
  );
}