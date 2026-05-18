import ServicesPage from "@/components/dashboard/pages/Servicespage";
import SectionContainer from "@/components/dashboard/SectionContainer";
export const metadata = {
  title: "Services | ACT Education CRM",
  description: "Manage educational services, workflows, and stages for student visa applications and admissions.",
};
export default function page() {
  return (
    <SectionContainer>
      <ServicesPage/>
    </SectionContainer>
  )
}
