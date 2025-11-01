"use client";

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
import { CheckIcon, CopyIcon } from "lucide-react";
import { type ComponentProps, useContext, useState } from "react";
import { AuthUIContext } from "../../../lib/auth-ui-provider";
import type { SettingsCardClassNames } from "../shared/settings-card";

interface BackupCodesDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  backupCodes: string[];
}

export function BackupCodesDialog({ classNames, backupCodes, onOpenChange, ...props }: BackupCodesDialogProps) {
  const { localization } = useContext(AuthUIContext);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const codeText = backupCodes.join("\n");
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className={classNames?.dialog?.content}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>{localization.BACKUP_CODES}</DialogTitle>

          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {localization.BACKUP_CODES_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((code, index) => (
            <div key={index} className="rounded-md bg-muted p-2 text-center font-mono text-sm">
              {code}
            </div>
          ))}
        </div>

        <DialogFooter className={classNames?.dialog?.footer}>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            disabled={copied}
            className={cn(classNames?.button, classNames?.outlineButton)}
          >
            {copied ? (
              <>
                <CheckIcon className={classNames?.icon} />
                {localization.COPIED_TO_CLIPBOARD}
              </>
            ) : (
              <>
                <CopyIcon className={classNames?.icon} />
                {localization.COPY_ALL_CODES}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={() => onOpenChange?.(false)}
            className={cn(classNames?.button, classNames?.primaryButton)}
          >
            {localization.CONTINUE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
