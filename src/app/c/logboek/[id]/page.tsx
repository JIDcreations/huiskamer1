import { Placeholder } from "@/components/placeholder";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Placeholder eyebrow={`Entry ${id}`} title="Logboek" note="Een entry uit je logboek" step={5} />;
}
