import SectionContainer from "@/components/dashboard/SectionContainer";
import Tasks from "@/components/dashboard/pages/Tasks";

export const metadata = {
  title: "Tasks | ACT Education CRM",
  description: "Create, assign, and track tasks related to applications and client management.",
};

export default function TasksPage() {
  return (
  <SectionContainer>
    <Tasks />
  </SectionContainer>
  );
}
