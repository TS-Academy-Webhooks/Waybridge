import { redirect } from "next/navigation";
import { LogOut, Mail, ShieldCheck, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/dal";
import { logoutAction } from "@/features/auth/auth-actions";
import { AppearanceToggle } from "@/features/dashboard/components/appearance-toggle";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Your account details and session controls.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Information tied to your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <InfoRow icon={User} label="Name" value={user.name} />
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Role</span>
            <Badge variant="secondary" className="ml-auto capitalize">
              {user.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how Waybridge looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <AppearanceToggle />
        </CardContent>
      </Card>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Sign out of this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={logoutAction}>
            <Button type="submit" variant="destructive">
              <LogOut />
              Log out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 text-muted-foreground" />
      <span className="text-sm font-medium">{label}</span>
      <span className="ml-auto text-sm text-muted-foreground">{value}</span>
    </div>
  );
}
