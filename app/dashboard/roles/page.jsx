import Roles from '@/components/dashboard/pages/Roles'
import SectionContainer from '@/components/dashboard/SectionContainer'

export const metadata = {
  title: "Roles | ACT Education CRM",
  description: "Create and manage user roles with custom permissions for your organization.",
};

export default function page() {
  return (
    <SectionContainer>
      <Roles/>
    </SectionContainer>
  )
}
