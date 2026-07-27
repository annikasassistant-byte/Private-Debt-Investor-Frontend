"use client";

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

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

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
            <Select
              value={theme}
              onValueChange={(v) => v && setTheme(v)}
            >
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
          <CardDescription>Choose what we notify you about.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            "Payment confirmations",
            "Upcoming due dates",
            "New reports",
            "Platform announcements",
          ].map((item) => (
            <div key={item} className="flex items-center justify-between">
              <Label htmlFor={item}>{item}</Label>
              <Switch
                id={item}
                defaultChecked
                onCheckedChange={() => toast.message("Preference saved (demo)")}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
