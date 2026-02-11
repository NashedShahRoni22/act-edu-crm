import Login from "@/components/auth/Login";
import PublicRoute from "@/components/private/PublicRoute";

export default function page() {
  return (
    <PublicRoute>
      <Login/>      
    </PublicRoute>
  )
}
