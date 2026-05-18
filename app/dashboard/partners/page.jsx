import PartnersPage from "@/components/dashboard/pages/Partnerspage";

export const metadata = {
  title: "Partners | ACT Education CRM",
  description: "View and manage education partners, their branches, and available services and workflows.",
};

export default function page() {
  return (
    <div>
      <PartnersPage/>
    </div>
  )
}
