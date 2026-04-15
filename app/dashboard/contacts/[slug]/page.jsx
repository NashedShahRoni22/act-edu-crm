import ContactDetailsPage from "@/components/dashboard/pages/ContactDetailsPage";

export default async function Page({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  return <ContactDetailsPage slug={slug} />;
}
