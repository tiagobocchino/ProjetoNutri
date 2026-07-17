import { redirect } from "next/navigation";
import Link from "next/link";
import { getAppUser, getAuthUser } from "@/lib/auth";

export default async function PacienteLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const appUser = await getAppUser();
  if (!appUser) redirect("/onboarding");
  if (appUser.role !== "paciente") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <header className="flex items-center justify-between border-b border-[color:var(--color-border)] bg-white px-6 py-4">
        <Link href="/portal" className="font-display text-lg font-semibold text-[color:var(--color-primary)]">
          ProjetoNutri
        </Link>
        <form action="/api/auth/signout" method="post">
          <button className="text-sm text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-destructive)]">
            Sair
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-3xl p-6 md:p-10">{children}</main>
    </div>
  );
}
