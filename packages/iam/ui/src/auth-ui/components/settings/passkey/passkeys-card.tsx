"use client";

import { CardContent } from "@beep/ui/components/card";
// import { Form } from "@beep/ui/components/form"
import { Form, makeFormOptions, useAppForm } from "@beep/ui/form";
import { cn } from "@beep/ui-core/utils";
// import { useForm } from "react-hook-form"
import * as S from "effect/Schema";
import { useContext, useState } from "react";
import type { AuthLocalization } from "../../../lib/auth-localization";
import { AuthUIContext } from "../../../lib/auth-ui-provider";
import { getLocalizedError } from "../../../lib/utils";
import { SessionFreshnessDialog } from "../shared/session-freshness-dialog";
import type { SettingsCardClassNames } from "../shared/settings-card";
import { SettingsCard } from "../shared/settings-card";
import { PasskeyCell } from "./passkey-cell";

export interface PasskeysCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
}

export function PasskeysCard({ className, classNames, localization }: PasskeysCardProps) {
  const {
    authClient,
    freshAge,
    hooks: { useListPasskeys, useSession },
    localization: authLocalization,
    toast,
  } = useContext(AuthUIContext);

  localization = { ...authLocalization, ...localization };

  const { data: passkeys, isPending, refetch } = useListPasskeys();

  const { data: sessionData } = useSession();
  const session = sessionData?.session;
  const isFresh = session ? Date.now() - new Date(session?.createdAt).getTime() < freshAge * 1000 : false;

  const [showFreshnessDialog, setShowFreshnessDialog] = useState(false);

  const form = useAppForm({
    ...makeFormOptions({
      schema: S.Struct({}),
      defaultValues: {},
      validator: "onSubmit",
    }),
    onSubmit: async () => {
      // If session isn't fresh, show the freshness dialog
      if (!isFresh) {
        setShowFreshnessDialog(true);
        return;
      }

      try {
        await authClient.passkey.addPasskey({
          fetchOptions: { throw: true },
        });
        await refetch?.();
      } catch (error) {
        toast({
          variant: "error",
          message: getLocalizedError({ error, localization }),
        });
      }
    },
  });

  return (
    <>
      <SessionFreshnessDialog
        open={showFreshnessDialog}
        onOpenChange={setShowFreshnessDialog}
        classNames={classNames}
        localization={localization}
      />

      <Form onSubmit={form.handleSubmit}>
        <SettingsCard
          className={className}
          classNames={classNames}
          actionLabel={localization.ADD_PASSKEY}
          description={localization.PASSKEYS_DESCRIPTION}
          instructions={localization.PASSKEYS_INSTRUCTIONS}
          isPending={isPending}
          title={localization.PASSKEYS}
        >
          {passkeys && passkeys.length > 0 && (
            <CardContent className={cn("grid gap-4", classNames?.content)}>
              {passkeys?.map((passkey) => (
                <PasskeyCell key={passkey.id} classNames={classNames} localization={localization} passkey={passkey} />
              ))}
            </CardContent>
          )}
        </SettingsCard>
      </Form>
    </>
  );
}
