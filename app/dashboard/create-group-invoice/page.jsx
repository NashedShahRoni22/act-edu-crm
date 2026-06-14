import CreateGroupInvoicePage from "@/components/dashboard/group-invoice/CreateGroupInvoicePage";

export const metadata = {
  title: "Create Group Invoice | ACT Education CRM",
  description: "Create a new group invoice and associate multiple unpaid invoices.",
};

export default function page() {
  return <CreateGroupInvoicePage />;
}
