import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Finaliza o aceite de um convite: vincula o paciente ao usuário autenticado
 * e cria o app_user com papel 'paciente'. Server-only (service role), pois o
 * paciente ainda não tem app_user (RLS não o cobriria).
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sessão expirada. Abra o link do convite novamente." }, { status: 401 });
  }

  const { token } = await request.json().catch(() => ({}));
  if (!token) {
    return NextResponse.json({ error: "Convite inválido." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("patient_invite")
    .select("id, tenant_id, patient_id, email, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return NextResponse.json({ error: "Convite não encontrado." }, { status: 404 });
  }
  if (invite.accepted_at) {
    return NextResponse.json({ error: "Este convite já foi utilizado." }, { status: 409 });
  }
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Convite expirado. Peça um novo ao seu nutricionista." }, { status: 410 });
  }
  if (invite.email.toLowerCase() !== (user.email ?? "").toLowerCase()) {
    return NextResponse.json({ error: "Este convite é para outro e-mail." }, { status: 403 });
  }

  // Evita duplicar app_user (ex.: reenvio).
  const { data: jaExiste } = await admin
    .from("app_user")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!jaExiste) {
    const { error: eAppUser } = await admin.from("app_user").insert({
      auth_user_id: user.id,
      tenant_id: invite.tenant_id,
      email: invite.email,
      role: "paciente",
    });
    if (eAppUser) {
      return NextResponse.json({ error: "Falha ao ativar o acesso." }, { status: 500 });
    }
  }

  await admin
    .from("patient")
    .update({ user_id: user.id, status: "ativo" })
    .eq("id", invite.patient_id);

  await admin.from("patient_invite").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);

  return NextResponse.json({ ok: true });
}
