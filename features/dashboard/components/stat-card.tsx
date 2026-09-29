// features/dashboard/components/stat-card.tsx
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCount } from "@/features/dashboard/components/stat-count";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  title,
  value,
  icon: Icon,
  href,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  href?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">
          <StatCount value={value} />
        </CardTitle>
        <CardAction>
          <Icon className="size-5 text-muted-foreground" />
        </CardAction>
      </CardHeader>
      {href ? (
        <CardContent>
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            View all
            <ArrowUpRight className="size-3.5" />
          </Link>
        </CardContent>
      ) : null}
    </Card>
  );
}
