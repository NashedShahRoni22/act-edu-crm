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
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: UserCheck,
    label: "Office Check-in",
    path: "/dashboard/office-checkin",
  },
  {
    icon: Users,
    label: "Contacts",
    path: "/dashboard/contacts",
  },
  {
    icon: Briefcase,
    label: "Services",
    path: "/dashboard/services",
  },
  {
    icon: UserCircle,
    label: "Partners",
    path: "/dashboard/partners",
  },
  {
    icon: Package,
    label: "Products",
    path: "/dashboard/products",
  },
  {
    icon: FileText,
    label: "Applications",
    path: "/dashboard/applications",
  },
  {
    icon: MessageSquare,
    label: "Conversations",
    path: "/dashboard/conversations",
  },
  {
    icon: FileStack,
    label: "Quotations",
    path: "/dashboard/quotations",
  },
  {
    icon: UserCog,
    label: "Accounts",
    path: "/dashboard/accounts",
    hasSubmenu: true,
    children:
    [
      {
        label: "Invoices",
        path: "/dashboard/invoices",
      },
      {
        label: "Payments",
        path: "/dashboard/payments",
      },
    ]
  },
  {
    icon: UsersRound,
    label: "Teams",
    path: "/dashboard/teams",
    hasSubmenu: true,
    children:
    [
      {
        label: "Offices",
        path: "/dashboard/offices",
      },
      {
        label: "Users",
        path: "/dashboard/users",
      },
      {
        label: "Roles",
        path: "/dashboard/roles",
      },
    ]
  },
  {
    icon: UsersRound,
    label: "Agents",
    path: "/dashboard/agents",
  },
  {
    icon: Wrench,
    label: "Tools",
    path: "/dashboard/tools",
  },
];
