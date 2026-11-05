import { requireMember } from "@/lib/tenant";
import { OrgForm } from "./org-form";

export default async function OrgSettingsPage({ params }: PageProps<"/painel/[slug]/barbearia">) {
  const { slug } = await params;
  const { org } = await requireMember(slug, ["owner"]);
  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-2">Barbearia</p>
      <h1 className="mb-8 font-display text-5xl leading-none sm:text-6xl">Configurações</h1>
      <OrgForm org={org} />
    </div>
  );
}
