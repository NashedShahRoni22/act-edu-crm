import ApplicationPage from "@/components/dashboard/pages/ApplicationPage";
import SectionContainer from "@/components/dashboard/SectionContainer";

export const metadata = {
  title: "Applications | ACT Education CRM",
  description: "Manage student applications, track progress through workflow stages, and view application details.",
};

export default function page() {
  return (
    <SectionContainer>
        <ApplicationPage/>
    </SectionContainer>
  )
}
