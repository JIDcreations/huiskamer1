import { Placeholder } from "@/components/placeholder";

export default async function Page({ params }: { params: Promise<{ id: string; pageId: string }> }) {
  const { pageId } = await params;
  return <Placeholder eyebrow={`Tafel, pagina ${pageId}`} title="Tafel" note="Een gedeelde pagina" step={6} />;
}
