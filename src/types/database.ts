// Tipos do banco (schema public) — ProjetoNutri.
// Mantido à mão por enquanto (schema pequeno). Ao evoluir o schema, regenerar com
// a CLI do Supabase (requer Docker):
//   npx supabase gen types typescript --db-url <pooler-url> > src/types/database.ts

export type UserRole = "nutricionista" | "paciente";
export type PatientStatus = "convidado" | "ativo" | "inativo" | "arquivado";
export type DocStatus = "rascunho" | "ativa" | "arquivada";
export type HospitalTipo =
  | "internacao"
  | "cirurgia"
  | "diagnostico"
  | "alergia"
  | "medicacao"
  | "outro";

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
      anamnese: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          dados: Record<string, unknown>;
          versao: number;
          created_by: string | null;
        } & Timestamps;
        Insert: Partial<Database["public"]["Tables"]["anamnese"]["Row"]> & {
          tenant_id: string;
          patient_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["anamnese"]["Row"]>;
        Relationships: [];
      };
      prescription: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          titulo: string;
          status: DocStatus;
          valido_ate: string | null;
        } & Timestamps;
        Insert: Partial<Database["public"]["Tables"]["prescription"]["Row"]> & {
          tenant_id: string;
          patient_id: string;
          titulo: string;
        };
        Update: Partial<Database["public"]["Tables"]["prescription"]["Row"]>;
        Relationships: [];
      };
      prescription_item: {
        Row: {
          id: string;
          tenant_id: string;
          prescription_id: string;
          suplemento: string;
          dose: string | null;
          horario: string | null;
          duracao: string | null;
          observacao: string | null;
          ordem: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["prescription_item"]["Row"]> & {
          tenant_id: string;
          prescription_id: string;
          suplemento: string;
        };
        Update: Partial<Database["public"]["Tables"]["prescription_item"]["Row"]>;
        Relationships: [];
      };
      habit: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          nome: string;
          meta_semanal: number | null;
          ativo: boolean;
        } & Timestamps;
        Insert: Partial<Database["public"]["Tables"]["habit"]["Row"]> & {
          tenant_id: string;
          patient_id: string;
          nome: string;
        };
        Update: Partial<Database["public"]["Tables"]["habit"]["Row"]>;
        Relationships: [];
      };
      habit_log: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          habit_id: string;
          data: string;
          concluido: boolean;
          nota: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["habit_log"]["Row"]> & {
          tenant_id: string;
          patient_id: string;
          habit_id: string;
          data: string;
        };
        Update: Partial<Database["public"]["Tables"]["habit_log"]["Row"]>;
        Relationships: [];
      };
      food_recall: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          data: string;
          observacoes: string | null;
        } & Timestamps;
        Insert: Partial<Database["public"]["Tables"]["food_recall"]["Row"]> & {
          tenant_id: string;
          patient_id: string;
          data: string;
        };
        Update: Partial<Database["public"]["Tables"]["food_recall"]["Row"]>;
        Relationships: [];
      };
      food_recall_entry: {
        Row: {
          id: string;
          tenant_id: string;
          food_recall_id: string;
          horario: string | null;
          alimento: string;
          quantidade: string | null;
          local: string | null;
          ordem: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["food_recall_entry"]["Row"]> & {
          tenant_id: string;
          food_recall_id: string;
          alimento: string;
        };
        Update: Partial<Database["public"]["Tables"]["food_recall_entry"]["Row"]>;
        Relationships: [];
      };
      exam_record: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          tipo: string;
          data_exame: string | null;
          file_path: string | null;
          resultados: Record<string, unknown> | null;
          observacoes: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["exam_record"]["Row"]> & {
          tenant_id: string;
          patient_id: string;
          tipo: string;
        };
        Update: Partial<Database["public"]["Tables"]["exam_record"]["Row"]>;
        Relationships: [];
      };
      hospital_history: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          tipo: HospitalTipo;
          descricao: string;
          data_evento: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["hospital_history"]["Row"]> & {
          tenant_id: string;
          patient_id: string;
          descricao: string;
        };
        Update: Partial<Database["public"]["Tables"]["hospital_history"]["Row"]>;
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
      current_patient_id: { Args: Record<never, never>; Returns: string };
    };
    Enums: {
      user_role: UserRole;
      patient_status: PatientStatus;
      doc_status: DocStatus;
      hospital_tipo: HospitalTipo;
    };
  };
};
