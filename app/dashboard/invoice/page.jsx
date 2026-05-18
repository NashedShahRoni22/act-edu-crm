import InvoicePage from '@/components/dashboard/pages/InvoicePage'

export const metadata = {
  title: "Invoices | ACT Education CRM",
  description: "Create and manage invoices for clients and partners. Track commission and general invoices.",
};

export default function page() {
  return (
    <InvoicePage/>
  )
}
