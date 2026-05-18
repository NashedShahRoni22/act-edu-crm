import OfficeCheckInPage from "@/components/dashboard/pages/Officecheckinpage";

export const metadata = {
  title: "Office Check-In | ACT Education CRM",
  description: "Track and manage office check-ins for clients and students. Monitor visits and attendance.",
};

export default function page() {
  return (
    <div>
      <OfficeCheckInPage/> 
    </div>
  )
}
