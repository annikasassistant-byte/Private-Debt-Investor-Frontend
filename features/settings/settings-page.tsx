"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useGetProfileQuery,
  useUpdateNotificationPreferencesMutation,
} from "@/services/authApi";
import { getApiErrorMessage } from "@/services/auth-mappers";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

const PREF_FIELDS = [
  { key: "paymentConfirmations", label: "Payment confirmations" },
  { key: "upcomingDueDates", label: "Upcoming due dates" },
  { key: "newReports", label: "New reports" },
  { key: "platformAnnouncements", label: "Platform announcements" },
] as const;

type PrefKey = (typeof PREF_FIELDS)[number]["key"];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { data: profile, isLoading } = useGetProfileQuery();
  const [updatePrefs, { isLoading: saving }] = useUpdateNotificationPreferencesMutation();
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    paymentConfirmations: true,
    upcomingDueDates: true,
    newReports: true,
    platformAnnouncements: true,
  });

  useEffect(() => {
    const p = profile?.notificationPreferences;
    if (!p) return;
    setPrefs({
      paymentConfirmations: p.paymentConfirmations !== false,
      upcomingDueDates: p.upcomingDueDates !== false,
      newReports: p.newReports !== false,
      platformAnnouncements: p.platformAnnouncements !== false,
    });
  }, [profile]);

  if (isLoading) return <LoadingSkeleton variant="page" />;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Appearance and notification preferences.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the portal looks on your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={(v) => v && setTheme(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Saved to your account on the server.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {PREF_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key}>{label}</Label>
              <Switch
                id={key}
                checked={prefs[key]}
                disabled={saving}
                onCheckedChange={async (checked) => {
                  const next = { ...prefs, [key]: checked };
                  setPrefs(next);
                  try {
                    await updatePrefs(next).unwrap();
                    toast.success("Preference saved");
                  } catch (error) {
                    setPrefs(prefs);
                    toast.error(getApiErrorMessage(error, "Unable to save preference"));
                  }
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
