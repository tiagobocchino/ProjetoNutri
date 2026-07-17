// Tipos do banco (schema public) — ProjetoNutri.
// Mantido à mão por enquanto (schema pequeno). Ao evoluir o schema, regenerar com
// a CLI do Supabase (requer Docker):
//   npx supabase gen types typescript --db-url <pooler-url> > src/types/database.ts

export type UserRole = "nutricionista" | "paciente";
export type PatientStatus = "convidado" | "ativo" | "inativo" | "arquivado";

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      tenant: {
        Row: {
          id: string;
          nome: string;
          slug: string;
          owner_user_id: string | null;
          crn: string | null;
          telefone: string | null;
          logo_url: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          nome: string;
          slug: string;
          owner_user_id?: string | null;
          crn?: string | null;
          telefone?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenant"]["Insert"]>;
        Relationships: [];
      };
      app_user: {
        Row: {
          id: string;
          auth_user_id: string;
          tenant_id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
        } & Timestamps;
        Insert: {
          id?: string;
          auth_user_id: string;
          tenant_id: string;
          email: string;
          full_name?: string | null;
          role: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["app_user"]["Insert"]>;
        Relationships: [];
      };
      patient: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          nome: string;
          email: string | null;
          telefone: string | null;
          data_nascimento: string | null;
          sexo: string | null;
          endereco: Record<string, unknown> | null;
          objetivo: string | null;
          esporte: string | null;
          status: PatientStatus;
          observacoes: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          tenant_id: string;
          user_id?: string | null;
          nome: string;
          email?: string | null;
          telefone?: string | null;
          data_nascimento?: string | null;
          sexo?: string | null;
          endereco?: Record<string, unknown> | null;
          objetivo?: string | null;
          esporte?: string | null;
          status?: PatientStatus;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["patient"]["Insert"]>;
        Relationships: [];
      };
      patient_invite: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          email: string;
          token: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          patient_id: string;
          email: string;
          token: string;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["patient_invite"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      create_nutricionista_tenant: {
        Args: { p_nome: string; p_slug: string; p_full_name: string };
        Returns: string;
      };
      current_tenant_id: { Args: Record<never, never>; Returns: string };
      current_role_claim: { Args: Record<never, never>; Returns: string };
    };
    Enums: {
      user_role: UserRole;
      patient_status: PatientStatus;
    };
  };
};
