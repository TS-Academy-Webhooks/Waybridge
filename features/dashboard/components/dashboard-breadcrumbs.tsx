"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BreadcrumbEntry = {
  href: string;
  label: string;
};

type DashboardNavigationContextValue = {
  entries: BreadcrumbEntry[];
  isReady: boolean;
  registerLabel: (href: string, label: string) => void;
};

const DashboardNavigationContext =
  createContext<DashboardNavigationContextValue | null>(null);

const DASHBOARD_ROUTE_ROOTS = [
  "/dashboard",
  "/shipments",
  "/webhooks",
  "/events",
  "/deliveries",
  "/demo-receiver",
  "/settings",
];

function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

function isDashboardPath(pathname: string) {
  return DASHBOARD_ROUTE_ROOTS.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
}

function getDefaultBreadcrumbLabel(pathname: string) {
  const exactLabels: Record<string, string> = {
    "/dashboard": "Overview",
    "/shipments": "Shipments",
    "/shipments/new": "New shipment",
    "/webhooks": "Webhooks",
    "/webhooks/new": "New webhook",
    "/events": "Events",
    "/deliveries": "Deliveries",
    "/demo-receiver": "Demo Receiver",
    "/settings": "Settings",
  };
  const exactLabel = exactLabels[pathname];
  if (exactLabel) return exactLabel;

  if (/^\/shipments\/[^/]+$/.test(pathname)) return "Shipment details";
  if (/^\/webhooks\/[^/]+\/edit$/.test(pathname)) return "Edit webhook";
  if (/^\/webhooks\/[^/]+$/.test(pathname)) return "Webhook details";
  if (/^\/events\/[^/]+$/.test(pathname)) return "Event details";
  if (/^\/deliveries\/[^/]+$/.test(pathname)) return "Delivery details";

  const segment = pathname.split("/").filter(Boolean).at(-1);
  if (!segment) return "Dashboard";

  return segment
    .split(/[-_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isBreadcrumbEntry(value: unknown): value is BreadcrumbEntry {
  if (
    typeof value !== "object" ||
    value === null ||
    !("href" in value) ||
    !("label" in value) ||
    typeof value.href !== "string" ||
    typeof value.label !== "string"
  ) {
    return false;
  }

  const href = normalizePathname(value.href);
  return (
    href === value.href &&
    isDashboardPath(href) &&
    value.label.trim().length > 0
  );
}

function readNavigationHistory(storageKey: string): BreadcrumbEntry[] {
  const serialized = window.sessionStorage.getItem(storageKey);
  if (serialized === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    console.warn("Invalid saved dashboard navigation history was reset.");
    window.sessionStorage.removeItem(storageKey);
    return [];
  }

  if (!Array.isArray(parsed)) {
    console.warn("Invalid saved dashboard navigation history was reset.");
    window.sessionStorage.removeItem(storageKey);
    return [];
  }

  const entries: BreadcrumbEntry[] = [];
  let skippedInvalidEntry = false;
  for (const value of parsed) {
    if (!isBreadcrumbEntry(value)) {
      skippedInvalidEntry = true;
      continue;
    }
    entries.push({ href: value.href, label: value.label.trim() });
  }

  if (skippedInvalidEntry) {
    console.warn("Invalid entries in dashboard navigation history were ignored.");
  }
  return entries;
}

export function DashboardNavigationProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const storageKey = `waybridge:dashboard-navigation:${encodeURIComponent(userId)}`;
  const [entries, setEntries] = useState<BreadcrumbEntry[]>([]);
  const [isReady, setIsReady] = useState(false);
  const isReadyRef = useRef(false);
  const lastPathnameRef = useRef<string | null>(null);
  const pendingLabelsRef = useRef(new Map<string, string>());

  const registerLabel = useCallback((href: string, label: string) => {
    const normalizedHref = normalizePathname(href);
    const normalizedLabel = label.trim();
    if (!isDashboardPath(normalizedHref) || normalizedLabel.length === 0) {
      throw new Error("Dashboard breadcrumb labels require a dashboard route and title.");
    }

    if (!isReadyRef.current || lastPathnameRef.current !== normalizedHref) {
      pendingLabelsRef.current.set(normalizedHref, normalizedLabel);
    }

    setEntries((currentEntries) => {
      const lastIndex = currentEntries.length - 1;
      if (
        lastIndex < 0 ||
        currentEntries[lastIndex].href !== normalizedHref ||
        currentEntries[lastIndex].label === normalizedLabel
      ) {
        return currentEntries;
      }

      const updatedEntries = [...currentEntries];
      updatedEntries[lastIndex] = {
        ...updatedEntries[lastIndex],
        label: normalizedLabel,
      };
      return updatedEntries;
    });
  }, []);

  useEffect(() => {
    const currentHref = normalizePathname(pathname);

    if (!isReadyRef.current) {
      const restoredEntries = readNavigationHistory(storageKey);
      const pendingLabel = pendingLabelsRef.current.get(currentHref);
      pendingLabelsRef.current.delete(currentHref);
      const lastIndex = restoredEntries.length - 1;

      if (lastIndex >= 0 && restoredEntries[lastIndex].href === currentHref) {
        if (pendingLabel) {
          restoredEntries[lastIndex] = {
            ...restoredEntries[lastIndex],
            label: pendingLabel,
          };
        }
      } else {
        restoredEntries.push({
          href: currentHref,
          label: pendingLabel ?? getDefaultBreadcrumbLabel(currentHref),
        });
      }

      lastPathnameRef.current = currentHref;
      isReadyRef.current = true;
      setEntries(restoredEntries);
      setIsReady(true);
      return;
    }

    if (currentHref === lastPathnameRef.current) return;

    lastPathnameRef.current = currentHref;
    const pendingLabel = pendingLabelsRef.current.get(currentHref);
    pendingLabelsRef.current.delete(currentHref);
    setEntries((currentEntries) => [
      ...currentEntries,
      {
        href: currentHref,
        label: pendingLabel ?? getDefaultBreadcrumbLabel(currentHref),
      },
    ]);
  }, [pathname, storageKey]);

  useEffect(() => {
    if (!isReady) return;
    window.sessionStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entries, isReady, storageKey]);

  return (
    <DashboardNavigationContext.Provider
      value={{ entries, isReady, registerLabel }}
    >
      {children}
    </DashboardNavigationContext.Provider>
  );
}

function useDashboardNavigation() {
  const context = useContext(DashboardNavigationContext);
  if (!context) {
    throw new Error(
      "Dashboard breadcrumb components must be rendered inside DashboardNavigationProvider.",
    );
  }
  return context;
}

export function DashboardBreadcrumbTitle({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const { registerLabel } = useDashboardNavigation();

  useEffect(() => {
    registerLabel(href, label);
  }, [href, label, registerLabel]);

  return null;
}

export function DashboardBreadcrumbs() {
  const { entries, isReady } = useDashboardNavigation();
  const listRef = useRef<HTMLOListElement>(null);
  const currentEntry = entries.at(-1);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollLeft = listRef.current.scrollWidth;
    }
  }, [entries]);

  if (!isReady || !currentEntry) return null;

  return (
    <Breadcrumb
      aria-label="Dashboard navigation history"
      className="min-w-0 flex-1"
    >
      <BreadcrumbList
        ref={listRef}
        className="w-full min-w-0 flex-nowrap overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {entries.length > 1 ? (
          <>
            <DropdownMenu>
              <BreadcrumbItem className="shrink-0 md:hidden">
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7"
                    aria-label="Show previous pages"
                  >
                    <MoreHorizontal aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
              </BreadcrumbItem>
              <DropdownMenuContent
                align="start"
                className="w-64 max-w-[80vw]"
              >
                <DropdownMenuLabel>Previous pages</DropdownMenuLabel>
                {entries.slice(0, -1).map((entry, index) => (
                  <DropdownMenuItem
                    key={`${entry.href}-${index}`}
                    asChild
                    className="w-full max-w-[min(80vw,20rem)] truncate"
                  >
                    <Link href={entry.href} title={entry.label}>
                      {entry.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <BreadcrumbSeparator className="shrink-0 md:hidden" />
          </>
        ) : null}
        <BreadcrumbItem className="min-w-0 md:hidden">
          <BreadcrumbPage
            className="max-w-[30vw] truncate sm:max-w-[40vw]"
            title={currentEntry.label}
          >
            {currentEntry.label}
          </BreadcrumbPage>
        </BreadcrumbItem>
        {entries.map((entry, index) => {
          const isCurrent = index === entries.length - 1;
          return (
            <Fragment key={`${entry.href}-${index}`}>
              {index > 0 ? (
                <BreadcrumbSeparator className="hidden shrink-0 md:inline-flex" />
              ) : null}
              <BreadcrumbItem className="hidden min-w-0 shrink-0 md:inline-flex">
                {isCurrent ? (
                  <BreadcrumbPage
                    className="max-w-56 truncate"
                    title={entry.label}
                  >
                    {entry.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="max-w-56 truncate">
                    <Link href={entry.href} title={entry.label}>
                      {entry.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
