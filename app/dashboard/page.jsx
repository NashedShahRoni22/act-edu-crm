import DashboardPage from "@/components/dashboard/pages/DashboardPage";

export const metadata = {
  title: "Dashboard | ACT Education CRM",
  description: "Overview of your applications, clients, and key metrics. Manage your education CRM operations efficiently.",
};

export default function page() {
  return (
    <div>
      <DashboardPage/>
    </div>
  )
}
