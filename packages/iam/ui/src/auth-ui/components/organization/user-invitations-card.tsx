"use client";

import { Button } from "@beep/ui/components/button";
import { Card, CardContent } from "@beep/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@beep/ui/components/dropdown-menu";
import { cn } from "@beep/ui-core/utils";
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";
import { CheckIcon, EllipsisIcon, Loader2, XIcon } from "lucide-react";
import { useContext, useMemo, useState } from "react";
import { AuthUIContext } from "../../lib/auth-ui-provider";
import { getLocalizedError } from "../../lib/utils";
import type { SettingsCardProps } from "../settings/shared/settings-card";
import { SettingsCard } from "../settings/shared/settings-card";
import { UserAvatar } from "../user-avatar";

export function UserInvitationsCard({
  className,
  classNames,
  localization: localizationProp,
  ...props
}: SettingsCardProps) {
  const {
    hooks: { useListUserInvitations, useListOrganizations },
    localization: contextLocalization,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { data: invitations, refetch: refetchInvitations } = useListUserInvitations();
  const { refetch: refetchOrganizations } = useListOrganizations();

  const handleRefresh = async () => {
    await refetchInvitations?.();
    await refetchOrganizations?.();
  };

  const pendingInvitations = invitations?.filter((invitation) => invitation.status === "pending");

  if (!pendingInvitations?.length) return null;

  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      title={localization.PENDING_INVITATIONS}
      description={localization.PENDING_USER_INVITATIONS_DESCRIPTION || localization.PENDING_INVITATIONS_DESCRIPTION}
      {...props}
    >
      <CardContent className={cn("grid gap-4", classNames?.content)}>
        {pendingInvitations.map((invitation) => (
          <UserInvitationRow
            key={invitation.id}
            classNames={classNames}
            invitation={{
              id: invitation.id,
              email: invitation.email,
              role: O.isSome(invitation.role) ? invitation.role.value : "",
              status: invitation.status,
              expiresAt: DateTime.toDate(invitation.expiresAt),
            }}
            onChanged={handleRefresh}
          />
        ))}
      </CardContent>
    </SettingsCard>
  );
}

function UserInvitationRow({
  classNames,
  invitation,
  onChanged,
}: {
  classNames?: SettingsCardProps["classNames"];
  invitation: {
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: Date;
  };
  onChanged?: () => unknown;
}) {
  const {
    authClient,
    organization: organizationOptions,
    localization: contextLocalization,
    toast,
  } = useContext(AuthUIContext);

  const localization = contextLocalization;

  const [isLoading, setIsLoading] = useState(false);

  const builtInRoles = [
    { role: "owner", label: localization.OWNER },
    { role: "admin", label: localization.ADMIN },
    { role: "member", label: localization.MEMBER },
  ];

  const roles = [...builtInRoles, ...(organizationOptions?.customRoles || [])];
  const role = roles.find((r) => r.role === invitation.role);

  const handleAccept = async () => {
    setIsLoading(true);

    try {
      await authClient.organization.acceptInvitation({
        invitationId: invitation.id,
        fetchOptions: { throw: true },
      });

      await onChanged?.();

      toast({
        variant: "success",
        message: localization.INVITATION_ACCEPTED,
      });
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, localization }),
      });
    }

    setIsLoading(false);
  };

  const handleReject = async () => {
    setIsLoading(true);

    try {
      await authClient.organization.rejectInvitation({
        invitationId: invitation.id,
        fetchOptions: { throw: true },
      });

      await onChanged?.();

      toast({
        variant: "success",
        message: localization.INVITATION_REJECTED,
      });
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, localization }),
      });
    }

    setIsLoading(false);
  };

  return (
    <Card className={cn("flex-row items-center p-4", classNames?.cell)}>
      <div className="flex flex-1 items-center gap-2">
        <UserAvatar className="my-0.5" user={{ email: invitation.email }} localization={localization} />

        <div className="grid flex-1 text-left leading-tight">
          <span className="truncate font-semibold text-sm">{invitation.email}</span>

          <span className="truncate text-muted-foreground text-xs">
            {localization.EXPIRES} {invitation.expiresAt.toLocaleDateString()}
          </span>
        </div>
      </div>

      <span className="truncate text-sm opacity-70">{role?.label}</span>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn("relative ms-auto", classNames?.button, classNames?.outlineButton)}
              disabled={isLoading}
              size="icon"
              type="button"
              variant="outline"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <EllipsisIcon className={classNames?.icon} />}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuItem onClick={handleAccept} disabled={isLoading}>
              <CheckIcon className={classNames?.icon} />

              {localization.ACCEPT}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleReject} disabled={isLoading} variant="destructive">
              <XIcon className={classNames?.icon} />

              {localization.REJECT}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
