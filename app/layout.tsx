import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white text-slate-900">
        <header className="border-b">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold">
              Hub de prompts (Missions Locales)
            </Link>
            <nav className="flex gap-3 text-sm">
              <Link href="/admin" className="underline underline-offset-4">
                Admin
              </Link>
              <Link href="/prompts" className="underline underline-offset-4">Prompts</Link>
              <Link href="/logout" className="underline underline-offset-4">Se déconnecter</Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}