import EditClient from "@/components/dashboard/pages/EditClient";

export default async function Page({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  return (
    <div>
      <EditClient slug={slug} />
    </div>
  );
}
