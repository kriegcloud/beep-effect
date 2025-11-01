"use client";

import { Button } from "@beep/ui/components/button";
import { Card } from "@beep/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@beep/ui/components/dialog";
import { cn } from "@beep/ui-core/utils";
import type { Organization } from "better-auth/plugins/organization";
import { Loader2 } from "lucide-react";
import { type ComponentProps, useContext, useMemo, useState } from "react";
import type { AuthLocalization } from "../../lib/auth-localization";
import { AuthUIContext } from "../../lib/auth-ui-provider";
import { getLocalizedError } from "../../lib/utils";
import type { SettingsCardClassNames } from "../settings/shared/settings-card";
import { OrganizationCellView } from "./organization-cell-view";

export interface LeaveOrganizationDialogProps extends ComponentProps<typeof Dialog> {
  className?: string;
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
  organization: Organization;
}

export function LeaveOrganizationDialog({
  organization,
  className,
  classNames,
  localization: localizationProp,
  onOpenChange,
  ...props
}: LeaveOrganizationDialogProps) {
  const {
    authClient,
    hooks: { useListOrganizations },
    localization: contextLocalization,
    toast,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { refetch: refetchOrganizations } = useListOrganizations();

  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveOrganization = async () => {
    setIsLeaving(true);

    try {
      await authClient.organization.leave({
        organizationId: organization.id,
        fetchOptions: { throw: true },
      });

      await refetchOrganizations?.();

      toast({
        variant: "success",
        message: localization.LEAVE_ORGANIZATION_SUCCESS,
      });

      onOpenChange?.(false);
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, localization }),
      });
    }

    setIsLeaving(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={classNames?.dialog?.content} onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {localization.LEAVE_ORGANIZATION}
          </DialogTitle>

          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {localization.LEAVE_ORGANIZATION_CONFIRM}
          </DialogDescription>
        </DialogHeader>

        <Card className={cn("my-2 flex-row p-4", className, classNames?.cell)}>
          <OrganizationCellView organization={organization} localization={localization} />
        </Card>

        <DialogFooter className={classNames?.dialog?.footer}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            className={cn(classNames?.button, classNames?.outlineButton)}
            disabled={isLeaving}
          >
            {localization.CANCEL}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleLeaveOrganization}
            className={cn(classNames?.button, classNames?.destructiveButton)}
            disabled={isLeaving}
          >
            {isLeaving && <Loader2 className="animate-spin" />}

            {localization.LEAVE_ORGANIZATION}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
