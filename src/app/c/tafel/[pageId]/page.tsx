import { Placeholder } from "@/components/placeholder";

export default async function Page({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  return <Placeholder eyebrow={`Pagina ${pageId}`} title="Tafel" note="Een pagina die jullie samen schrijven" step={5} />;
}
