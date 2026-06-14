import GroupInvoiceDetailsPage from "@/components/dashboard/group-invoice/GroupInvoiceDetailsPage";

export const metadata = {
  title: "Group Invoice Details | ACT Education CRM",
  description: "View details of a specific group invoice and its included invoices.",
};

export default function page() {
  return <GroupInvoiceDetailsPage />;
}
