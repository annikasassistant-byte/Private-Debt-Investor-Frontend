"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { michaelInvestment } from "@/mock-data/investments";
import { formatCurrency } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getUserInitials } from "@/lib/user-display";
import {
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/services/authApi";
import { getApiErrorMessage, mapServerUserToClient } from "@/services/auth-mappers";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export function ProfileSettings() {
  const setUser = useAuthStore((s) => s.setUser);
  const localUser = useAuthStore((s) => s.user);
  const { data: profile, isLoading, isError } = useGetProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName || "");
    setLastName(profile.lastName || "");
    setPhone(profile.phone || "");
    setUser(mapServerUserToClient(profile));
  }, [profile, setUser]);

  if (isLoading) return <LoadingSkeleton variant="page" />;

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || localUser?.name || profile?.email || "User";
  const initials = getUserInitials(displayName);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal and contact information.</p>
      </div>
      {isError && (
        <p className="text-sm text-destructive">Unable to load profile from the server.</p>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{displayName}</CardTitle>
            <p className="text-sm text-muted-foreground">{profile?.email || localUser?.email}</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email || localUser?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button
            className="sm:col-span-2 w-fit"
            disabled={isSaving}
            onClick={async () => {
              try {
                const updated = await updateProfile({
                  firstName: firstName.trim(),
                  lastName: lastName.trim(),
                  phone: phone.trim() || null,
                }).unwrap();
                setUser(mapServerUserToClient(updated));
                toast.success("Profile updated");
              } catch (error) {
                toast.error(getApiErrorMessage(error, "Unable to update profile"));
              }
            }}
          >
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </CardContent>
      </Card>
      {localUser?.role === "investor" && (
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
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <PasswordInput
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <PasswordInput
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button
            variant="outline"
            disabled={isChangingPassword}
            onClick={async () => {
              if (!currentPassword || !newPassword) {
                toast.error("Enter current and new password");
                return;
              }
              try {
                await changePassword({ currentPassword, newPassword }).unwrap();
                setCurrentPassword("");
                setNewPassword("");
                toast.success("Password updated — please sign in again");
                useAuthStore.getState().logout();
                window.location.href = "/login";
              } catch (error) {
                toast.error(getApiErrorMessage(error, "Unable to change password"));
              }
            }}
          >
            {isChangingPassword ? "Updating…" : "Update password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
