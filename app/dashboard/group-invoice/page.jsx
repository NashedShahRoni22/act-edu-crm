import GroupInvoicePage from "@/components/dashboard/group-invoice/GroupInvoicePage";

export const metadata = {
  title: "Group Invoices | ACT Education CRM",
  description:
    "Create and manage group invoices for clients and partners. Track commission and general invoices.",
};
export default function page() {
  return <GroupInvoicePage />;
}
