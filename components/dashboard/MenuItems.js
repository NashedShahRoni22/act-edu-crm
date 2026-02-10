import {
  LayoutDashboard,
  UserCheck,
  Users,
  Briefcase,
  UserCircle,
  Package,
  FileText,
  MessageSquare,
  FileStack,
  UserCog,
  UsersRound,
  Wrench,
} from "lucide-react";

export const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  {
    icon: UserCheck,
    label: "Office Check-in",
    path: "/dashboard/office-checkin",
  },
  {
    icon: Users,
    label: "Contacts",
    path: "/dashboard/office-checkin/contacts",
  },
  {
    icon: Briefcase,
    label: "Services",
    path: "/dashboard/office-checkin/services",
  },
  {
    icon: UserCircle,
    label: "Partners",
    path: "/dashboard/office-checkin/partners",
  },
  {
    icon: Package,
    label: "Products",
    path: "/dashboard/office-checkin/products",
  },
  {
    icon: FileText,
    label: "Applications",
    path: "/dashboard/office-checkin/applications",
  },
  {
    icon: MessageSquare,
    label: "Conversations",
    path: "/dashboard/office-checkin/conversations",
  },
  {
    icon: FileStack,
    label: "Quotations",
    path: "/dashboard/office-checkin/quotations",
  },
  {
    icon: UserCog,
    label: "Accounts",
    path: "/dashboard/office-checkin/accounts",
    hasSubmenu: true,
  },
  { icon: UsersRound, label: "Teams", path: "/dashboard/office-checkin/teams" },
  {
    icon: UsersRound,
    label: "Agents",
    path: "/dashboard/office-checkin/agents",
  },
  { icon: Wrench, label: "Tools", path: "/dashboard/office-checkin/tools" },
];