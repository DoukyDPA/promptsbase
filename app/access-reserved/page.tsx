import Link from "next/link";

export default function AccessReservedPage() {
  return (
    <div className="max-w-lg space-y-3">
      <h1 className="text-2xl font-semibold">Accès réservé</h1>
      <p className="text-slate-700">
        Votre compte est connecté, mais vous n’êtes pas autorisé à accéder à l’outil.
      </p>
      <p className="text-slate-700">
        Contactez l’administrateur pour demander l’ouverture de vos droits.
      </p>
      <Link href="/login" className="underline underline-offset-4">
        Revenir à la connexion
      </Link>
    </div>
  );
}
