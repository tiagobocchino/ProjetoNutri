import Link from "next/link";

const modulos = [
  { titulo: "Anamnese & Prescrição", desc: "Fichas clínicas e suplementação organizadas por paciente." },
  { titulo: "Dietas estruturadas", desc: "Monte planos com refeições, substituições e versão para impressão." },
  { titulo: "Hábitos & Recordatório", desc: "Acompanhe rotina alimentar e adesão do paciente no dia a dia." },
  { titulo: "Exames & Histórico", desc: "Guarde exames, histórico hospitalar e evolução em um só lugar." },
  { titulo: "Portal do paciente", desc: "Cada paciente acessa apenas sua dieta, documentos e agenda." },
  { titulo: "Agenda integrada", desc: "Sincronize com o Google Agenda e receba solicitações de horário." },
];

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="bg-hero-pattern noise-overlay relative overflow-hidden">
        <div className="container-max section-padding relative z-10 text-center">
          <span className="section-label justify-center">
            Consultoria nutricional digital
          </span>
          <h1 className="text-4xl md:text-6xl font-semibold text-white max-w-3xl mx-auto leading-tight">
            A plataforma que organiza a consultoria dos seus pacientes
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-xl mx-auto">
            Gerencie dietas, prescrições, anamnese e agenda. Seus pacientes com acesso
            exclusivo ao próprio acompanhamento.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link
              href="/cadastro"
              className="btn-relay inline-flex items-center rounded-2xl bg-[color:var(--color-accent)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
            >
              Começar agora
            </Link>
            <Link
              href="/login"
              className="glass-panel inline-flex items-center rounded-2xl px-7 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Entrar
            </Link>
          </div>
        </div>
      </section>

      {/* Módulos */}
      <section className="container-max section-padding">
        <div className="text-center mb-14">
          <span className="section-label justify-center">O que a plataforma faz</span>
          <h2 className="text-3xl md:text-4xl font-semibold">Tudo do atendimento em um lugar</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modulos.map((m) => (
            <div key={m.titulo} className="card-surface p-7">
              <h3 className="text-xl font-semibold mb-2">{m.titulo}</h3>
              <p className="text-[color:var(--color-muted-foreground)] text-sm leading-relaxed">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Rodapé */}
      <footer className="border-t border-[color:var(--color-border)] py-10 text-center text-sm text-[color:var(--color-muted-foreground)]">
        <p className="data-number">ProjetoNutri © {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
