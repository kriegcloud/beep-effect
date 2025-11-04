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
import { useTranslate } from "@beep/ui/i18n";
import { cn } from "@beep/ui-core/utils";
import * as DateTime from "effect/DateTime";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { KeyRoundIcon, Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { useContext, useState } from "react";
import type { AuthLocalization } from "../../../lib/auth-localization";
import { AuthUIContext } from "../../../lib/auth-ui-provider";
import { getLocalizedError } from "../../../lib/utils";
import type { ApiKey } from "../../../types/api-key";
import type { Refetch } from "../../../types/refetch";
import type { SettingsCardClassNames } from "../shared/settings-card";

interface ApiKeyDeleteDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  apiKey: ApiKey;
  localization?: AuthLocalization;
  refetch?: Refetch;
}

export function ApiKeyDeleteDialog({
  classNames,
  apiKey,
  localization,
  refetch,
  onOpenChange,
  ...props
}: ApiKeyDeleteDialogProps) {
  const {
    localization: contextLocalization,
    mutators: { deleteApiKey },
    toast,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const { currentLang } = useTranslate();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      await deleteApiKey({ keyId: apiKey.id });
      await refetch?.();
      onOpenChange?.(false);
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, localization }),
      });
    }

    setIsLoading(false);
  };

  // Format expiration date or show "Never expires"
  const formatExpiration = () => {
    if (!apiKey.expiresAt) return localization.NEVER_EXPIRES;

    const expiresDate = DateTime.toDate(
      F.pipe(
        apiKey.expiresAt,
        O.match({
          onNone: () => DateTime.unsafeNow(),
          onSome: (d) => d,
        })
      )
    );
    return `${localization.EXPIRES} ${expiresDate.toLocaleDateString(currentLang.value ?? "en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className={classNames?.dialog?.content}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {localization.DELETE} {localization.API_KEY}
          </DialogTitle>

          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {localization.DELETE_API_KEY_CONFIRM}
          </DialogDescription>
        </DialogHeader>

        <Card className={cn("my-2 flex-row items-center gap-3 px-4 py-3", classNames?.cell)}>
          <KeyRoundIcon className={cn("size-4", classNames?.icon)} />

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{O.isSome(apiKey.name) ? apiKey.name.value : null}</span>

              <span className="text-muted-foreground text-sm">
                {O.isSome(apiKey.start) ? apiKey.start.value : null}
                {"******"}
              </span>
            </div>

            <div className="text-muted-foreground text-xs">{formatExpiration()}</div>
          </div>
        </Card>

        <DialogFooter className={classNames?.dialog?.footer}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange?.(false)}
            disabled={isLoading}
            className={cn(classNames?.button, classNames?.secondaryButton)}
          >
            {localization.CANCEL}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className={cn(classNames?.button, classNames?.destructiveButton)}
          >
            {isLoading && <Loader2 className="animate-spin" />}
            {localization.DELETE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
