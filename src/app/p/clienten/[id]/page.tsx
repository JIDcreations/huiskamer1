import { Placeholder } from "@/components/placeholder";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Placeholder eyebrow={`Dossier ${id}`} title="Cliëntdossier" note="Overzicht, tijdlijn, Tafel en meer" step={6} />;
}
