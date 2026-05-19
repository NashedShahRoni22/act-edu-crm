"use client";

import { useState } from "react";
import SectionContainer from "../SectionContainer";
import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

// Import individual section components
import ContactSummarySection from "../sections/ContactSummarySection";
import MyAppointmentsCard from "../sections/MyAppointmentsCard";
import MyTasksCard from "../sections/MyTasksCard";
import CheckInQueueCard from "../sections/CheckInQueueCard";
import ApplicationRemindersCard from "../sections/ApplicationRemindersCard";
import ClientsLeaderboard from "../sections/ClientsLeaderboard";
import TopPartnersLeaderboard from "../sections/TopPartnersLeaderboard";
import TopProductsLeaderboard from "../sections/TopProductsLeaderboard";
import ApplicationsByWorkflowSection from "../sections/ApplicationsByWorkflowSection";
import WorkflowStagesSection from "../sections/WorkflowStagesSection";
import ApplicationsByStatusSection from "../sections/ApplicationsByStatusSection";

export default function DashboardPage() {
  const { accessToken } = useAppContext();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);

  // ============ API Queries ============

  // Fetch contact summary data
  const { data: summaryData } = useQuery({
    queryKey: ["/dashboard/contact-summary", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const contactSummary = summaryData?.data || {};

  // Fetch my appointments
  const { data: appointmentsData } = useQuery({
    queryKey: ["/dashboard/my-appointments", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const myAppointments = appointmentsData?.data || [];

  // Fetch my tasks
  const { data: tasksData } = useQuery({
    queryKey: ["/dashboard/my-tasks", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const myTasks = tasksData?.data || [];

  // Fetch clients by users
  const { data: clientsByUsersData } = useQuery({
    queryKey: ["/dashboard/clients-by-users", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  // Fetch workflows
  const { data: workflowsData } = useQuery({
    queryKey: ["/workflows", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const workflows = workflowsData?.data || [];

  // Initialize selectedWorkflowId with first workflow when workflows load
  if (workflows.length > 0 && !selectedWorkflowId) {
    setSelectedWorkflowId(workflows[0].id);
  }

  // Fetch applications by workflow
  const { data: applicationsByWorkflowData } = useQuery({
    queryKey: ["/dashboard/applications-by-workflow", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  // Fetch applications by workflow stages (using selected workflow)
  const { data: applicationsByStagesData } = useQuery({
    queryKey: [`/dashboard/applications-by-workflow-stages?workflow_id=${selectedWorkflowId}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!selectedWorkflowId,
  });
  const applicationsByStages = applicationsByStagesData?.data || {};

  // Fetch check-in queue
  const { data: checkInQueueData } = useQuery({
    queryKey: ["/dashboard/check-in-queue", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const checkInQueue = checkInQueueData?.data || {};

  // Fetch application reminders
  const { data: applicationRemindersData } = useQuery({
    queryKey: ["/dashboard/application-reminders", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const applicationReminders = applicationRemindersData?.data || {};

  // Fetch applications by status
  const { data: applicationsByStatusData } = useQuery({
    queryKey: ["/dashboard/applications-by-status", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  // Fetch top partners
  const { data: topPartnersData } = useQuery({
    queryKey: ["/dashboard/top-partners", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const topPartners = topPartnersData?.data || [];

  // Fetch top products
  const { data: topProductsData } = useQuery({
    queryKey: ["/dashboard/top-products", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const topProducts = topProductsData?.data || {};

  // ============ Data Mapping ============

  // Clients by users data - mapped from API with colors for leaderboard
  const colors = ["bg-blue-500", "bg-red-500", "bg-cyan-400", "bg-pink-400", "bg-purple-400", "bg-green-500"];
  const clientsByUsers = (clientsByUsersData?.data?.users || []).map((user, index) => ({
    name: user.name,
    count: user.total,
    color: colors[index % colors.length],
  }));

  // Applications by workflow data - mapped from API
  const applicationsByWorkflow = (applicationsByWorkflowData?.data || []).map((workflow) => ({
    name: workflow.name,
    value: workflow.value,
  }));

  // Applications by status data - mapped from API
  const applicationsByStatus = (applicationsByStatusData?.data || []).map((status) => ({
    name: status.name,
    value: status.value,
  }));

  return (
    <SectionContainer>
      {/* ============ Header Section ============ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome To ACT Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview & Stats - All Branches
          </p>
        </div>
        {/* <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Invite User
        </motion.button> */}
      </motion.div>

      {/* ============ Contact Summary Section ============ */}
      <ContactSummarySection contactSummary={contactSummary} />

      {/* ============ Cards Section ============ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <MyAppointmentsCard myAppointments={myAppointments} />
        <MyTasksCard myTasks={myTasks} />
        <CheckInQueueCard checkInQueue={checkInQueue} />
        <ApplicationRemindersCard applicationReminders={applicationReminders} />
      </div>

      {/* ============ Leaderboards Section ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <ClientsLeaderboard clientsByUsers={clientsByUsers} />
        <ApplicationsByWorkflowSection applicationsByWorkflow={applicationsByWorkflow} />
      </div>

      {/* ============ Workflow & Status Section ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <WorkflowStagesSection 
          applicationsByStages={applicationsByStages}
          workflows={workflows}
          selectedWorkflowId={selectedWorkflowId}
          onWorkflowChange={setSelectedWorkflowId}
        />
        <ApplicationsByStatusSection applicationsByStatus={applicationsByStatus} />
      </div>

      {/* ============ Top Partners & Products Section ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <TopPartnersLeaderboard topPartners={topPartners} />
        <TopProductsLeaderboard topProducts={topProducts} />
      </div>
    </SectionContainer>
  );
}
