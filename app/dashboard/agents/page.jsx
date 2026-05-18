import Agents from "@/components/dashboard/pages/Agents";
import SectionContainer from "@/components/dashboard/SectionContainer";
export const metadata = {
  title: "Agents | ACT Education CRM",
  description: "Manage education agents and consultants. Track agent performance and commissions.",
};
export default function page() {
  return (
    <SectionContainer>
      <Agents />
    </SectionContainer>
  );
}
