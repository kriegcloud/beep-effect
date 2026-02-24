"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@beep/notes/components/ui/alert-dialog";
import { Input } from "@beep/notes/registry/ui/input";
import { api, useTRPC } from "@beep/notes/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Icons } from "../ui/icons";
import { Label } from "../ui/label";

export function DeleteAccountButton() {
  const trpc = useTRPC();
  const { data: userSettings } = useQuery(trpc.user.getSettings.queryOptions());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  const deleteAccountMutation = api.user.deleteAccount.useMutation({
    onError: (error) => {
      toast.error(`Failed to delete account: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Account deleted successfully");
      // Perform a hard refresh to the home page
      window.location.href = "/";
    },
  });

  const handleDeleteAccount = () => {
    if (confirmEmail === userSettings?.email) {
      deleteAccountMutation.mutate();
    }
  };

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogTrigger asChild>
        <div className="flex h-auto w-full cursor-pointer items-center justify-between" role="button">
          <div>
            <Label className="text-destructive">Delete my account</Label>
            <p className="text-sm text-muted-foreground">
              Permanently delete the account and remove access from all workspaces.
            </p>
          </div>

          <Icons.chevronRight className="size-4" />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <Icons.alertCircle className="mx-auto size-9 text-destructive" />
          <AlertDialogTitle className="text-center">Delete your entire account permanently?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            This action cannot be undone. This will permanently delete your entire account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="space-y-2 rounded border p-2">
            <div className="flex items-center space-x-3">
              <Icons.user className="size-4" />
              <span className="font-medium">{userSettings?.name}</span>
              <span className="text-sm text-muted-foreground">Free Plan • 1 member</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-email">Please type in your email to confirm.</Label>
            <Input
              id="confirm-email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={userSettings?.email ?? ""}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction
            size="md"
            className="w-full bg-destructive hover:bg-destructive hover:brightness-110"
            disabled={confirmEmail !== userSettings?.email}
            onClick={handleDeleteAccount}
          >
            Permanently delete account
          </AlertDialogAction>
          <AlertDialogCancel size="md" className="w-full border-none font-medium text-muted-foreground">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
