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

export interface RemoveMemberDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
  member: Member & { user?: Partial<User> | null };
}

export function RemoveMemberDialog({
  member,
  classNames,
  localization: localizationProp,
  onOpenChange,
  ...props
}: RemoveMemberDialogProps) {
  const {
    authClient,
    hooks: { useListMembers },
    localization: contextLocalization,
    toast,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { refetch } = useListMembers({
    query: { organizationId: member.organizationId },
  });

  const [isRemoving, setIsRemoving] = useState(false);

  const removeMember = async () => {
    setIsRemoving(true);

    try {
      await authClient.organization.removeMember({
        memberIdOrEmail: member.id,
        organizationId: member.organizationId,
        fetchOptions: { throw: true },
      });

      toast({
        variant: "success",
        message: localization.REMOVE_MEMBER_SUCCESS,
      });

      await refetch?.();

      onOpenChange?.(false);
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, localization }),
      });
    }

    setIsRemoving(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={classNames?.dialog?.content} onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {localization.REMOVE_MEMBER}
          </DialogTitle>

          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {localization.REMOVE_MEMBER_CONFIRM}
          </DialogDescription>
        </DialogHeader>

        <MemberCellView className={classNames?.cell} member={member} localization={localization} />

        <DialogFooter className={classNames?.dialog?.footer}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            className={cn(classNames?.button, classNames?.outlineButton)}
            disabled={isRemoving}
          >
            {localization.CANCEL}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={removeMember}
            className={cn(classNames?.button, classNames?.destructiveButton)}
            disabled={isRemoving}
          >
            {isRemoving && <Loader2 className="animate-spin" />}

            {localization.REMOVE_MEMBER}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
