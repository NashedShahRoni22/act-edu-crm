import {
  LayoutDashboard,
  UserCheck,
  Users,
  Briefcase,
  UserCircle,
  Package,
  FileText,
  UserCog,
  UsersRound,
  Workflow,
  Building2,
  FileCheck,
  FileX,
  Clock,
  Receipt,
  CreditCard,
  Shield,
  BarChart2,
  FileBarChart,
  ClipboardList,
  UserPlus,
} from "lucide-react";

export const railSections = [
  // ─── HOME ──────────────────────────────────────────────────────────
  {
    key: "home",
    label: "Home",
    icon: LayoutDashboard,
    groups: [
      {
        items: [
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
        ],
      },
    ],
  },

  // ─── SALES ─────────────────────────────────────────────────────────
  {
    key: "sales",
    label: "Sales",
    icon: Users,
    groups: [
      {
        items: [
          {
            icon: Users,
            label: "Contacts",
            path: "/dashboard/contacts",
          },
          {
            icon: UserCircle,
            label: "Partners",
            path: "/dashboard/partners",
          },
          {
            icon: UserPlus,
            label: "Agents",
            path: "/dashboard/agents",
          },
        ],
      },
    ],
  },

  // ─── INVENTORY ──────────────────────────────────────────────────
  {
    key: "inventory",
    label: "Inventory",
    icon: Package,
    groups: [
      {
        items: [
          {
            icon: Package,
            label: "Products",
            path: "/dashboard/products",
          },
          {
            icon: Briefcase,
            label: "Services",
            path: "/dashboard/services",
          },
        ],
      },
    ],
  },

  // ─── APPLICATIONS ──────────────────────────────────────────────────
  {
    key: "applications",
    label: "Activity",
    icon: FileText,
    groups: [
      {
        items: [
          {
            icon: FileText,
            label: "Applications",
            path: "/dashboard/applications",
          },
          {
            icon: ClipboardList,
            label: "Tasks",
            path: "/dashboard/tasks",
          },
        ],
      },
    ],
  },

  // ─── FINANCE ───────────────────────────────────────────────────────
  {
    key: "finance",
    label: "Finance",
    icon: Receipt,
    groups: [
      {
        items: [
          {
            icon: Receipt,
            label: "Invoices",
            path: "/dashboard/invoice",
          },
          {
            icon: Receipt,
            label: "Group Invoices",
            path: "/dashboard/group-invoice",
          },
          {
            icon: CreditCard,
            label: "Payments",
            path: "/dashboard/payments",
          },
        ],
      },
    ],
  },

  // ─── TEAM ──────────────────────────────────────────────────────────
  {
    key: "team",
    label: "Team",
    icon: UsersRound,
    groups: [
      {
        items: [
          {
            icon: Building2,
            label: "Offices",
            path: "/dashboard/offices",
          },
          {
            icon: Users,
            label: "Users",
            path: "/dashboard/users",
          },
          {
            icon: Shield,
            label: "Roles",
            path: "/dashboard/roles",
          },
        ],
      },
    ],
  },

  // ─── REPORTS ───────────────────────────────────────────────────────
  {
    key: "reports",
    label: "Reports",
    icon: BarChart2,
    groups: [
      {
        items: [
          {
            icon: Users,
            label: "Client Reports",
            path: "/dashboard/reports/clients",
          },
          {
            icon: FileBarChart,
            label: "By Application",
            path: "/dashboard/reports/clients-by-application",
          },
          {
            icon: FileText,
            label: "Applications",
            path: "/dashboard/reports/applications",
          },
          {
            icon: UserCheck,
            label: "Office Check-ins",
            path: "/dashboard/reports/office-check-ins",
          },
          {
            icon: ClipboardList,
            label: "Tasks Reports",
            path: "/dashboard/reports/tasks",
          },
        ],
      },
    ],
  },
];

// Flat list for any legacy imports
export const menuItems = railSections.flatMap((section) =>
  section.groups.flatMap((group) => group.items),
);
