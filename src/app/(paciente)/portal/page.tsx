import { getAppUser } from "@/lib/auth";

export default async function PortalPage() {
  const appUser = await getAppUser();
  return (
    <div>
      <span className="section-label">Meu acompanhamento</span>
      <h1 className="text-3xl font-semibold">
        Olá, {appUser?.full_name?.split(" ")[0] ?? "paciente"} 👋
      </h1>
      <p className="mt-2 text-[color:var(--color-muted-foreground)]">
        Em breve você verá aqui sua dieta, hábitos e agenda.
      </p>
    </div>
  );
}
