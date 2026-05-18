import Offices from '@/components/dashboard/pages/Offices'
import SectionContainer from '@/components/dashboard/SectionContainer'
export const metadata = {
  title: "Offices | ACT Education CRM",
  description: "Manage office locations, staffing, and branch information for your education business.",
};
export default function page() {
  return (
    <SectionContainer>
      <Offices/>
    </SectionContainer>
  )
}
