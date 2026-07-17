import { redirect } from "next/navigation";
import Link from "next/link";
import { getAppUser, getAuthUser } from "@/lib/auth";

export default async function NutriLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const appUser = await getAppUser();
  if (!appUser) redirect("/onboarding"); // autenticado, mas sem tenant ainda
  if (appUser.role !== "nutricionista") redirect("/portal");

  return (
    <div className="flex min-h-screen bg-[color:var(--color-background)]">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[color:var(--color-border)] bg-white p-6 md:flex">
        <Link href="/dashboard" className="mb-8 font-display text-xl font-semibold text-[color:var(--color-primary)]">
          ProjetoNutri
        </Link>
        <nav className="flex flex-col gap-1 text-sm">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/pacientes" label="Pacientes" />
          <NavLink href="/agenda" label="Agenda" />
          <NavLink href="/configuracoes" label="Configurações" />
        </nav>
        <form action="/api/auth/signout" method="post" className="mt-auto pt-6">
          <button className="text-sm text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-destructive)]">
            Sair
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-secondary)]"
    >
      {label}
    </Link>
  );
}
