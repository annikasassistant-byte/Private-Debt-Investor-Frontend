"use client";

import { useAuthStore } from "@/lib/auth-store";
import { michaelInvestment } from "@/mock-data/investments";
import { formatCurrency } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getUserInitials } from "@/lib/user-display";

export function ProfileSettings() {
  const user = useAuthStore((s) => s.user);
  const initials = getUserInitials(user?.name);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal and contact information.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user?.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{user?.title}</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue={user?.email} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input defaultValue={user?.phone} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Company</Label>
            <Input defaultValue={user?.company} />
          </div>
          <Button
            className="sm:col-span-2 w-fit"
            onClick={() => toast.success("Profile saved (demo)")}
          >
            Save changes
          </Button>
        </CardContent>
      </Card>
      {user?.role === "investor" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Investment summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Allocated</p>
              <p className="font-semibold">{formatCurrency(michaelInvestment.principal)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Outstanding</p>
              <p className="font-semibold">{formatCurrency(michaelInvestment.outstandingBalance)}</p>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
        </CardHeader>
        <CardContent className="grid max-w-md gap-3">
          <Input type="password" placeholder="Current password" />
          <Input type="password" placeholder="New password" />
          <Button variant="outline" onClick={() => toast.success("Password updated (demo)")}>
            Update password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
