import Users from "@/components/dashboard/pages/Users";
import SectionContainer from "@/components/dashboard/SectionContainer";
export const metadata = {
  title: "Users | ACT Education CRM",
  description: "Manage system users, roles, permissions, and access control for your team.",
};
export default function page() {
  return (
    <SectionContainer>
      <Users/>
    </SectionContainer>
  )
}
