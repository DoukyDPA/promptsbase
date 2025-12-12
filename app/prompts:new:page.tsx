import { createPrompt } from "@/actions/prompts";
import { requireMember } from "@/lib/auth/requireMember";
import { redirect } from "next/navigation";

export default async function NewPromptPage() {
  await requireMember();

  async function onCreate(formData: FormData) {
    "use server";
    const id = await createPrompt(formData);
    redirect(`/prompts/${id}`);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Créer un prompt</h1>

      <form action={onCreate} className="space-y-3 rounded-lg border p-4">
        <Field label="Titre">
          <input name="title" className="w-full rounded-md border px-3 py-2 text-sm" required />
        </Field>

        <Field label="Décrivez la situation professionnelle">
          <textarea name="situation" className="w-full rounded-md border px-3 py-2 text-sm" rows={3} required />
        </Field>

        <Field label="Objectif attendu">
          <textarea name="objective" className="w-full rounded-md border px-3 py-2 text-sm" rows={2} required />
        </Field>

        <Field label="Public concerné">
          <input name="audience" className="w-full rounded-md border px-3 py-2 text-sm" required />
        </Field>

        <Field label="Prompt (version 1)">
          <textarea name="content" className="w-full rounded-md border px-3 py-2 text-sm font-mono" rows={8} required />
        </Field>

        <button className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50">
          Enregistrer
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}