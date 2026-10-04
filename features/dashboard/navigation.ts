import {
  Activity,
  LayoutDashboard,
  Package,
  Radio,
  Settings,
  SendHorizonal,
  Webhook,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type DashboardNavigationItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavigationItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Shipments", url: "/shipments", icon: Package },
  { title: "Webhooks", url: "/webhooks", icon: Webhook },
  { title: "Events", url: "/events", icon: Activity, adminOnly: true },
  { title: "Deliveries", url: "/deliveries", icon: SendHorizonal },
];

export const DASHBOARD_TOOLS_NAV_ITEMS: DashboardNavigationItem[] = [
  { title: "Demo Receiver", url: "/demo-receiver", icon: Radio },
  { title: "Settings", url: "/settings", icon: Settings },
];

const ALL_DASHBOARD_NAV_ITEMS = [
  ...DASHBOARD_NAV_ITEMS,
  ...DASHBOARD_TOOLS_NAV_ITEMS,
];

export function getDashboardSectionIcon(pathname: string): LucideIcon {
  const item = ALL_DASHBOARD_NAV_ITEMS.find(
    ({ url }) => pathname === url || pathname.startsWith(`${url}/`),
  );
  return item?.icon ?? LayoutDashboard;
}
