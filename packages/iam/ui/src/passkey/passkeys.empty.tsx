"use client";

import { Iconify } from "@beep/ui/atoms/iconify/iconify";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@beep/ui/components/empty";
import Button from "@mui/material/Button";

type PasskeysEmptyProps = {
  readonly onAdd?: (() => void) | undefined;
  readonly className?: string | undefined;
};

export const PasskeysEmpty = ({ onAdd, className }: PasskeysEmptyProps) => {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant={"icon"}>
          <Iconify icon={"solar:key-minimalistic-bold-duotone"} width={28} />
        </EmptyMedia>
        <EmptyTitle>No passkeys yet</EmptyTitle>
        <EmptyDescription>
          Add a passkey to sign in with Touch ID, Face ID, or your security key. Passkeys are fast, phishing-resistant,
          and replace manual passwords.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {onAdd && (
          <Button
            variant={"contained"}
            startIcon={<Iconify icon={"solar:add-square-bold-duotone"} width={20} />}
            onClick={(event) => {
              event.currentTarget.blur();
              onAdd();
            }}
          >
            Add passkey
          </Button>
        )}
        <div className={"text-muted-foreground text-xs"}>
          We&apos;ll prompt you to choose a device credential. Come back here anytime to manage your passkeys.
        </div>
      </EmptyContent>
    </Empty>
  );
};
