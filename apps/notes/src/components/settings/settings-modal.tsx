"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@beep/notes/registry/ui/avatar";
import { DialogContent, DialogTitle } from "@beep/notes/registry/ui/dialog";
import { Input } from "@beep/notes/registry/ui/input";
import { Spinner } from "@beep/notes/registry/ui/spinner";
import { useTRPC } from "@beep/notes/trpc/react";
import { useQuery } from "@tanstack/react-query";

import { Label } from "../ui/label";
import { DeleteAccountButton } from "./delete-account-button";

export function SettingsModal() {
  const trpc = useTRPC();
  const { data: userSettings, isLoading } = useQuery(trpc.user.getSettings.queryOptions());

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <DialogContent size="4xl" className="px-16 py-9">
      <div className="space-y-8">
        <DialogTitle className="text-2xl font-semibold">My profile</DialogTitle>

        <div className="flex items-center space-x-4">
          <Avatar className="size-16">
            <AvatarImage alt="Profile" src={userSettings?.profileImageUrl || "https://github.com/ziadbenameur.png"} />
            <AvatarFallback>{userSettings?.name?.slice(0, 2).toUpperCase() || "ZB"}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label htmlFor="preferred-name">Display name</Label>
            <Input id="preferred-name" className="max-w-xs" defaultValue={userSettings?.name || ""} readOnly />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Account</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">{userSettings?.email}</p>
              </div>
              {/* <Button variant="outline">Change email</Button> */}
            </div>

            <DeleteAccountButton />
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
