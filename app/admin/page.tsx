import { createMissionMember, updateUserPassword } from "@/actions/admin";
import { requireMember } from "@/lib/auth/requireMember";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { member } = await requireMember();
  if (member.role !== "admin") {
    redirect("/access-reserved");
  }

  const admin = supabaseAdmin();
  const { data: members, error } = await admin
    .from("members")
    .select("user_id,email,role,org")
    .order("org", { ascending: true, nullsFirst: false })
    .order("email", { ascending: true });

  if (error) throw error;

  type MemberRow = NonNullable<typeof members>[number];

  const grouped = (members || []).reduce<Record<string, MemberRow[]>>((acc, current) => {
    const key = current.org || "Sans mission locale";
    acc[key] = acc[key] || [];
    acc[key].push(current);
    return acc;
  }, {});

  const missions = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Administration</h1>
        <p className="text-sm text-slate-700">
          Créez des missions locales, rattachez des utilisateurs et gérez les mots de passe depuis cet espace réservé aux
          administrateurs.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border p-4 space-y-3">
          <div>
            <h2 className="font-semibold">Créer une mission locale et un compte</h2>
            <p className="text-sm text-slate-700">
              Saisissez le nom de la mission locale, l'email et le mot de passe du nouvel utilisateur. Le compte sera créé et
              rattaché à cette mission locale.
            </p>
          </div>

          <form action={createMissionMember} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Mission locale</label>
              <input
                name="mission"
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Mission locale de Paris"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Email utilisateur</label>
              <input
                type="email"
                name="email"
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="nom.prenom@example.fr"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Mot de passe initial</label>
              <input
                type="password"
                name="password"
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Mot de passe provisoire"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Rôle</label>
              <select name="role" className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="member">Membre</option>
                <option value="moderator">Modérateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            <button className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50">Créer le compte</button>
          </form>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <div>
            <h2 className="font-semibold">Mettre à jour un mot de passe</h2>
            <p className="text-sm text-slate-700">
              Saisissez l'identifiant Supabase d'un utilisateur ainsi qu'un nouveau mot de passe pour réinitialiser son accès.
            </p>
          </div>

          <form action={updateUserPassword} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">ID utilisateur</label>
              <input
                name="userId"
                className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                placeholder="uuid-supabase"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Nouveau mot de passe</label>
              <input
                type="password"
                name="newPassword"
                className="w-full rounded-md border px-3 py-2 text-sm"
                autoComplete="new-password"
                required
              />
            </div>

            <button className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50">Enregistrer</button>
          </form>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Missions locales enregistrées</h2>
        {missions.length === 0 && <p className="text-sm text-slate-700">Aucune mission locale enregistrée pour le moment.</p>}

        <div className="space-y-4">
          {missions.map((missionName) => (
            <div key={missionName} className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{missionName}</h3>
                <span className="text-xs rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                  {grouped[missionName]?.length || 0} utilisateur(s)
                </span>
              </div>

              <div className="space-y-2">
                {grouped[missionName]?.map((m) => (
                  <div key={m.user_id} className="flex flex-col rounded-md bg-slate-50 p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{m.email}</span>
                      <span className="text-xs rounded-full bg-white px-2 py-1 text-slate-700 border">{m.role}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-600 break-all">{m.user_id}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
