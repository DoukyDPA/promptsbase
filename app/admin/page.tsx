import { redirect } from "next/navigation";
import { requireMember } from "@/lib/auth/requireMember";

export default async function AdminPage() {
  const { member } = await requireMember();
  if (member.role !== "admin") redirect("/access-reserved");

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-600">Accès admin</p>
        <h1 className="text-2xl font-semibold">Gestion des membres</h1>
      </div>

      <p className="text-slate-700">
        Cette page rappelle comment ajouter un nouvel utilisateur dans l'application. L'accès public
        n'existe pas : seuls les comptes présents côté Supabase et dans la table <code>members</code>
        peuvent se connecter.
      </p>

      <ol className="space-y-3 rounded-lg border p-4 text-slate-800">
        <li>
          <span className="font-semibold">1. Créer le compte dans Supabase Auth :</span> ajoutez l'adresse
          email dans l'onglet Users et envoyez le lien de définition du mot de passe.
        </li>
        <li>
          <span className="font-semibold">2. Récupérer le <code>user_id</code> :</span> ouvrez la fiche de
          l'utilisateur pour copier son identifiant.
        </li>
        <li>
          <span className="font-semibold">3. Ajouter la ligne dans <code>members</code> :</span> saisissez
          le <code>user_id</code>, l'email, le rôle (<code>member</code>, <code>moderator</code> ou
          <code>admin</code>) et l'organisation éventuelle. Sans cette ligne, l'accès reste bloqué.
        </li>
      </ol>

      <p className="text-sm text-slate-600">
        Une fois ces étapes réalisées, la personne pourra se connecter via <code>/login</code>.
      </p>
    </div>
  );
}
