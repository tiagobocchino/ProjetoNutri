import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppUser } from "@/lib/auth";

/**
 * Cria um convite para um paciente e dispara o e-mail via Supabase Auth.
 * Só o nutricionista dono do tenant pode convidar (validado por RLS + checagem).
 */
export async function POST(request: NextRequest) {
  const appUser = await getAppUser();
  if (!appUser || appUser.role !== "nutricionista") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { patientId } = await request.json().catch(() => ({}));
  if (!patientId) {
    return NextResponse.json({ error: "Paciente não informado." }, { status: 400 });
  }

  const supabase = await createClient();
  // RLS garante que só vê pacientes do próprio tenant.
  const { data: patient } = await supabase
    .from("patient")
    .select("id, nome, email, tenant_id")
    .eq("id", patientId)
    .maybeSingle();

  if (!patient) {
    return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });
  }
  if (!patient.email) {
    return NextResponse.json(
      { error: "Cadastre um e-mail no paciente antes de convidar." },
      { status: 400 },
    );
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error: eInvite } = await supabase.from("patient_invite").insert({
    tenant_id: patient.tenant_id,
    patient_id: patient.id,
    email: patient.email,
    token,
    expires_at: expiresAt,
  });
  if (eInvite) {
    return NextResponse.json({ error: "Não foi possível registrar o convite." }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const redirectTo = `${appUrl}/auth/callback?next=/convite/${token}`;

  // Envio do e-mail de convite pelo Supabase (service role, server-only).
  const admin = createAdminClient();
  const { error: eMail } = await admin.auth.admin.inviteUserByEmail(patient.email, {
    redirectTo,
    data: { convite_token: token, tenant_id: patient.tenant_id },
  });

  if (eMail) {
    const jaExiste = /already been registered|already registered/i.test(eMail.message);
    return NextResponse.json(
      {
        error: jaExiste
          ? "Este e-mail já possui uma conta. Peça para o paciente entrar e enviaremos o vínculo pelo link."
          : "Convite registrado, mas o e-mail não pôde ser enviado.",
        link: redirectTo,
      },
      { status: jaExiste ? 409 : 502 },
    );
  }

  await supabase.from("patient").update({ status: "convidado" }).eq("id", patient.id);

  return NextResponse.json({ ok: true, link: redirectTo });
}
