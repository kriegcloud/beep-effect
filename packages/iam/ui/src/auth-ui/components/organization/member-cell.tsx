"use client";

import type { User } from "@beep/iam-infra/adapters/better-auth/types";
import { Button } from "@beep/ui/components/button";
import { Card } from "@beep/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@beep/ui/components/dropdown-menu";
import { cn } from "@beep/ui-core/utils";
import type { Member } from "better-auth/plugins/organization";
import { EllipsisIcon, UserCogIcon, UserXIcon } from "lucide-react";
import React, { useContext, useState } from "react";
import type { AuthLocalization } from "../../lib/auth-localization";
import { AuthUIContext } from "../../lib/auth-ui-provider";
import type { SettingsCardClassNames } from "../settings/shared/settings-card-types";
import { UserView } from "../user-view";

export interface MemberCellProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  member: Member & { user?: Partial<User> | null };
  localization?: AuthLocalization;
  hideActions?: boolean;
}

// Re-export MemberCellView from separate file to avoid circular dependency
export { MemberCellView } from "./member-cell-view";

export function MemberCell({
  className,
  classNames,
  member,
  localization: localizationProp,
  hideActions,
}: MemberCellProps) {
  const {
    organization: organizationOptions,
    hooks: { useListMembers, useSession, useListOrganizations, useHasPermission },
    localization: contextLocalization,
  } = useContext(AuthUIContext);
  const localization = { ...contextLocalization, ...localizationProp };

  const { data: sessionData } = useSession();
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [updateRoleDialogOpen, setUpdateRoleDialogOpen] = useState(false);

  const builtInRoles = [
    { role: "owner", label: localization.OWNER },
    { role: "admin", label: localization.ADMIN },
    { role: "member", label: localization.MEMBER },
  ];

  const { data } = useListMembers({
    query: { organizationId: member.organizationId },
  });

  const members = data?.members;

  const myRole = members?.find((m) => m.user?.id === sessionData?.user.id)?.role;
  const roles = [...builtInRoles, ...(organizationOptions?.customRoles || [])];
  const role = roles.find((r) => r.role === member.role);

  const isSelf = sessionData?.user.id === member?.userId;

  const { data: organizations } = useListOrganizations();
  const organization = organizations?.find((org) => org.id === member.organizationId);

  const { data: hasPermissionToUpdateMember } = useHasPermission({
    organizationId: member.organizationId,
    permission: { member: ["update"] },
  });

  // Lazy load dialogs to break circular dependency
  const RemoveMemberDialog = React.lazy(() =>
    import("./remove-member-dialog").then((m) => ({ default: m.RemoveMemberDialog }))
  );
  const LeaveOrganizationDialog = React.lazy(() =>
    import("./leave-organization-dialog").then((m) => ({ default: m.LeaveOrganizationDialog }))
  );
  const UpdateMemberRoleDialog = React.lazy(() =>
    import("./update-member-role-dialog").then((m) => ({ default: m.UpdateMemberRoleDialog }))
  );

  return (
    <>
      <Card className={cn("flex-row items-center p-4", className, classNames?.cell)}>
        <UserView user={member.user} localization={localization} className="flex-1" />

        <span className="text-xs opacity-70">{role?.label}</span>

        {!hideActions && (isSelf || member.role !== "owner" || myRole === "owner") && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={cn("relative ms-auto", classNames?.button, classNames?.outlineButton)}
                size="icon"
                type="button"
                variant="outline"
              >
                <EllipsisIcon className={classNames?.icon} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
              {hasPermissionToUpdateMember?.success && (
                <DropdownMenuItem onClick={() => setUpdateRoleDialogOpen(true)}>
                  <UserCogIcon className={classNames?.icon} />
                  {localization?.UPDATE_ROLE}
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => (isSelf ? setLeaveDialogOpen(true) : setRemoveDialogOpen(true))}
                variant="destructive"
              >
                <UserXIcon className={classNames?.icon} />
                {isSelf ? localization?.LEAVE_ORGANIZATION : localization?.REMOVE_MEMBER}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </Card>

      <React.Suspense fallback={null}>
        <RemoveMemberDialog
          open={removeDialogOpen}
          onOpenChange={setRemoveDialogOpen}
          member={member}
          classNames={classNames}
          localization={localization}
        />

        {organization && (
          <LeaveOrganizationDialog
            open={leaveDialogOpen}
            onOpenChange={setLeaveDialogOpen}
            organization={organization}
            classNames={classNames}
            localization={localization}
          />
        )}

        <UpdateMemberRoleDialog
          open={updateRoleDialogOpen}
          onOpenChange={setUpdateRoleDialogOpen}
          member={member}
          classNames={classNames}
          localization={localization}
        />
      </React.Suspense>
    </>
  );
}
