/**
 * Traduz mensagens de erro do Supabase Auth (inglês) para pt-BR claro.
 * Mapa central para não repetirmos diagnósticos errados: cada causa vira uma
 * mensagem específica em vez de um genérico "inválido".
 */
export type AuthErrorInfo = {
  message: string;
  /** true quando a causa é e-mail não confirmado (habilita reenvio). */
  needsConfirmation?: boolean;
};

export function traduzErroAuth(raw: string | undefined | null): AuthErrorInfo {
  const m = (raw ?? "").toLowerCase();

  if (m.includes("email not confirmed")) {
    return {
      message: "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada ou reenvie o link abaixo.",
      needsConfirmation: true,
    };
  }
  if (m.includes("invalid login credentials")) {
    return { message: "E-mail ou senha incorretos." };
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return { message: "Este e-mail já possui conta. Faça login." };
  }
  if (m.includes("password should be at least")) {
    return { message: "A senha é muito curta (mínimo 8 caracteres)." };
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return { message: "Muitas tentativas. Aguarde um instante e tente de novo." };
  }
  if (m.includes("unable to validate email") || m.includes("invalid email")) {
    return { message: "E-mail inválido." };
  }
  if (!m) {
    return { message: "Ocorreu um erro. Tente novamente." };
  }
  // fallback: mostra a causa real em vez de esconder
  return { message: `Não foi possível concluir: ${raw}` };
}
