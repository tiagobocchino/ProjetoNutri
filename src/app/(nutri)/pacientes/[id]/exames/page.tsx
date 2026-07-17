import { createClient } from "@/lib/supabase/server";
import { getAppUser } from "@/lib/auth";
import { ExamesManager } from "@/components/modules/exames-manager";

export default async function ExamesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appUser = await getAppUser();
  const supabase = await createClient();

  const { data: registros } = await supabase
    .from("exam_record")
    .select("id, tipo, data_exame, file_path, observacoes")
    .eq("patient_id", id)
    .order("data_exame", { ascending: false, nullsFirst: false });

  // URLs assinadas para os arquivos (bucket privado).
  const exames = await Promise.all(
    (registros ?? []).map(async (ex) => {
      let url: string | null = null;
      if (ex.file_path) {
        const { data } = await supabase.storage.from("exames").createSignedUrl(ex.file_path, 60 * 60);
        url = data?.signedUrl ?? null;
      }
      return { ...ex, url };
    }),
  );

  return <ExamesManager patientId={id} tenantId={appUser!.tenant_id} exames={exames} />;
}
