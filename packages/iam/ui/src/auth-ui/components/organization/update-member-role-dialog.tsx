"use client";

import type { User } from "@beep/iam-infra/adapters/better-auth/types";
import { Button } from "@beep/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@beep/ui/components/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@beep/ui/components/select";
import { cn } from "@beep/ui-core/utils";
import type { Member } from "better-auth/plugins/organization";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { useContext, useMemo, useState } from "react";
import type { AuthLocalization } from "../../lib/auth-localization";
import { AuthUIContext } from "../../lib/auth-ui-provider";
import { getLocalizedError } from "../../lib/utils";
import type { SettingsCardClassNames } from "../settings/shared/settings-card-types";
import { MemberCellView } from "./member-cell-view";

export interface UpdateMemberRoleDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
  member: Member & { user?: Partial<User> | null };
}

export function UpdateMemberRoleDialog({
  member,
  classNames,
  localization: localizationProp,
  onOpenChange,
  ...props
}: UpdateMemberRoleDialogProps) {
  const {
    authClient,
    hooks: { useSession, useListMembers },
    localization: contextLocalization,
    organization,
    toast,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { data, refetch } = useListMembers({
    query: { organizationId: member.organizationId },
  });

  const members = data?.members;

  const { data: sessionData } = useSession();

  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRole, setSelectedRole] = useState(member.role);

  const builtInRoles = [
    { role: "owner", label: localization.OWNER },
    { role: "admin", label: localization.ADMIN },
    { role: "member", label: localization.MEMBER },
  ];

  const roles = [...builtInRoles, ...(organization?.customRoles || [])];

  const currentUserRole = members?.find((m) => m.user?.id === sessionData?.user.id)?.role;

  const availableRoles = roles.filter((role) => {
    if (role.role === "owner") {
      return currentUserRole === "owner";
    }

    if (role.role === "admin") {
      return currentUserRole === "owner" || currentUserRole === "admin";
    }

    return true;
  });

  const updateMemberRole = async () => {
    if (selectedRole === member.role) {
      toast({
        variant: "error",
        message: `${localization.ROLE} ${localization.IS_THE_SAME}`,
      });

      return;
    }

    setIsUpdating(true);

    try {
      await authClient.organization.updateMemberRole({
        memberId: member.id,
        role: selectedRole,
        organizationId: member.organizationId,
        fetchOptions: {
          throw: true,
        },
      });

      toast({
        variant: "success",
        message: localization.MEMBER_ROLE_UPDATED,
      });

      await refetch?.();

      onOpenChange?.(false);
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, localization }),
      });
    }

    setIsUpdating(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={classNames?.dialog?.content} onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>{localization.UPDATE_ROLE}</DialogTitle>

          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {localization.UPDATE_ROLE_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <MemberCellView className={classNames?.cell} member={member} localization={localization} />

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={localization.SELECT_ROLE} />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role.role} value={role.role}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className={classNames?.dialog?.footer}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            className={cn(classNames?.button, classNames?.outlineButton)}
            disabled={isUpdating}
          >
            {localization.CANCEL}
          </Button>

          <Button
            type="button"
            onClick={updateMemberRole}
            className={cn(classNames?.button, classNames?.primaryButton)}
            disabled={isUpdating}
          >
            {isUpdating && <Loader2 className="animate-spin" />}

            {localization.UPDATE_ROLE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
