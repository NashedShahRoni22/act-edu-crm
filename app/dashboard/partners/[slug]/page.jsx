import PartnersDetailsPage from "@/components/dashboard/pages/PartnersDetailsPage";

export default async function Page({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  return <PartnersDetailsPage slug={slug} />;
}
