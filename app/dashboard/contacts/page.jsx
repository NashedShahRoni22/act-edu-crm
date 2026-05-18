import ContactsPage from "@/components/dashboard/pages/ContactsPage";

export const metadata = {
  title: "Contacts | ACT Education CRM",
  description: "Manage clients, partners, and contacts. Store and organize contact information for students and education providers.",
};

export default function page() {
  return (
    <div>
      <ContactsPage/>
    </div>
  )
}
