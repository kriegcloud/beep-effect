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
import { type ComponentProps, useContext } from "react";
import type { AuthLocalization } from "../../../lib/auth-localization";
import { AuthUIContext } from "../../../lib/auth-ui-provider";
import type { SettingsCardClassNames } from "./settings-card";

export interface SessionFreshnessDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
  title?: string;
  description?: string;
}

export function SessionFreshnessDialog({
  classNames,
  localization,
  title,
  description,
  onOpenChange,
  ...props
}: SessionFreshnessDialogProps) {
  const { basePath, localization: contextLocalization, viewPaths, navigate } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const handleSignOut = () => {
    navigate(`${basePath}/${viewPaths.SIGN_OUT}`);
    onOpenChange?.(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={cn("sm:max-w-md", classNames?.dialog?.content)}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {title || localization?.SESSION_EXPIRED || "Session Expired"}
          </DialogTitle>

          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {description || localization?.SESSION_NOT_FRESH}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className={classNames?.dialog?.footer}>
          <Button
            type="button"
            variant="secondary"
            className={cn(classNames?.button, classNames?.secondaryButton)}
            onClick={() => onOpenChange?.(false)}
          >
            {localization.CANCEL}
          </Button>

          <Button
            className={cn(classNames?.button, classNames?.primaryButton)}
            variant="default"
            onClick={handleSignOut}
          >
            {localization?.SIGN_OUT}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
