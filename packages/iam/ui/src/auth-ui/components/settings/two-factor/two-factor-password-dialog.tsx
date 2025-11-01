"use client";

// import { PasswordInput } from "../../password-input"
import { Button } from "@beep/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@beep/ui/components/dialog";
import { Form, makeFormOptions, useAppForm } from "@beep/ui/form";
import { cn } from "@beep/ui-core/utils";
import * as S from "effect/Schema";
import { Loader2 } from "lucide-react";
import { type ComponentProps, useContext, useState } from "react";
import { AuthUIContext } from "../../../lib/auth-ui-provider";
import { getLocalizedError } from "../../../lib/utils";

import type { SettingsCardClassNames } from "../shared/settings-card";
import { BackupCodesDialog } from "./backup-codes-dialog";

interface TwoFactorPasswordDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  isTwoFactorEnabled: boolean;
}

export function TwoFactorPasswordDialog({
  classNames,
  onOpenChange,
  isTwoFactorEnabled,
  ...props
}: TwoFactorPasswordDialogProps) {
  const { localization, authClient, basePath, viewPaths, navigate, toast, twoFactor } = useContext(AuthUIContext);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpURI, setTotpURI] = useState<string | null>(null);

  const form = useAppForm({
    ...makeFormOptions({
      schema: S.Struct({
        password: S.String,
      }),
      defaultValues: {
        password: "",
      },
      validator: "onSubmit",
    }),
    onSubmit: async ({ value }) => {
      try {
        const response = await authClient.twoFactor.enable({
          password: value.password,
          fetchOptions: { throw: true },
        });

        onOpenChange?.(false);
        setBackupCodes(response.backupCodes);

        if (twoFactor?.includes("totp")) {
          setTotpURI(response.totpURI);
        }

        setTimeout(() => {
          setShowBackupCodesDialog(true);
        }, 250);
      } catch (error) {
        toast({
          variant: "error",
          message: getLocalizedError({ error, localization }),
        });
      }
    },
  });

  const { isSubmitting } = form.state;

  // async function disableTwoFactor({ password }: z.infer<typeof formSchema>) {
  //     try {
  //         await authClient.twoFactor.disable({
  //             password,
  //             fetchOptions: { throw: true }
  //         })
  //
  //         toast({
  //             variant: "success",
  //             message: localization.TWO_FACTOR_DISABLED
  //         })
  //
  //         onOpenChange?.(false)
  //     } catch (error) {
  //         toast({
  //             variant: "error",
  //             message: getLocalizedError({ error, localization })
  //         })
  //     }
  // }

  return (
    <>
      <Dialog onOpenChange={onOpenChange} {...props}>
        <DialogContent className={cn("sm:max-w-md", classNames?.dialog)}>
          <DialogHeader className={classNames?.dialog?.header}>
            <DialogTitle className={classNames?.title}>{localization.TWO_FACTOR}</DialogTitle>

            <DialogDescription className={classNames?.description}>
              {isTwoFactorEnabled
                ? localization.TWO_FACTOR_DISABLE_INSTRUCTIONS
                : localization.TWO_FACTOR_ENABLE_INSTRUCTIONS}
            </DialogDescription>
          </DialogHeader>

          <Form onSubmit={form.handleSubmit}>
            {/*<form*/}
            {/*    onSubmit={form.handleSubmit(*/}
            {/*        isTwoFactorEnabled*/}
            {/*            ? disableTwoFactor*/}
            {/*            : enableTwoFactor*/}
            {/*    )}*/}
            {/*    className="grid gap-4"*/}
            {/*>*/}
            {/*    <FormField*/}
            {/*        control={form.control}*/}
            {/*        name="password"*/}
            {/*        render={({ field }) => (*/}
            {/*            <FormItem>*/}
            {/*                <FormLabel*/}
            {/*                    className={classNames?.label}*/}
            {/*                >*/}
            {/*                    {localization.PASSWORD}*/}
            {/*                </FormLabel>*/}

            {/*                <FormControl>*/}
            {/*                    <PasswordInput*/}
            {/*                        className={classNames?.input}*/}
            {/*                        placeholder={*/}
            {/*                            localization.PASSWORD_PLACEHOLDER*/}
            {/*                        }*/}
            {/*                        autoComplete="current-password"*/}
            {/*                        {...field}*/}
            {/*                    />*/}
            {/*                </FormControl>*/}

            {/*                <FormMessage*/}
            {/*                    className={classNames?.error}*/}
            {/*                />*/}
            {/*            </FormItem>*/}
            {/*        )}*/}
            {/*    />*/}

            <DialogFooter className={classNames?.dialog?.footer}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange?.(false)}
                className={cn(classNames?.button, classNames?.secondaryButton)}
              >
                {localization.CANCEL}
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(classNames?.button, classNames?.primaryButton)}
              >
                {isSubmitting && <Loader2 className="animate-spin" />}
                {isTwoFactorEnabled ? localization.DISABLE_TWO_FACTOR : localization.ENABLE_TWO_FACTOR}
              </Button>
            </DialogFooter>
            {/*</form>*/}
          </Form>
        </DialogContent>
      </Dialog>

      <BackupCodesDialog
        classNames={classNames}
        open={showBackupCodesDialog}
        onOpenChange={(open) => {
          setShowBackupCodesDialog(open);

          if (!open) {
            const url = `${basePath}/${viewPaths.TWO_FACTOR}`;
            navigate(twoFactor?.includes("totp") && totpURI ? `${url}?totpURI=${totpURI}` : url);
          }
        }}
        backupCodes={backupCodes}
      />
    </>
  );
}
