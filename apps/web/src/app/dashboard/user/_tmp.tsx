"use client";
import { paths } from "@beep/shared-domain";
import { usePathname, useRouter, useSearchParams } from "@beep/ui/hooks";
import { RouterLink } from "@beep/ui/routing";
import Button from "@mui/material/Button";
import * as F from "effect/Function";
import * as O from "effect/Option";
import React from "react";
import { AccountDialog } from "@/features/account/account-dialog";

export const TmpView = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isDialogOpen = React.useMemo(
    () => F.pipe(O.fromNullable(searchParams.get("settingsTab")), O.isSome),
    [searchParams]
  );

  const handleClose = React.useCallback(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("settingsTab");

    const nextSearch = nextParams.toString();
    const nextHref = nextSearch === "" ? pathname : `${pathname}?${nextSearch}`;

    router.replace(nextHref);
  }, [router, searchParams, pathname]);

  return (
    <>
      <Button component={RouterLink} href={paths.dashboard.user.accountSettings("general")} variant="contained">
        Open Dialog
      </Button>
      <AccountDialog open={isDialogOpen} onClose={handleClose} />
    </>
  );
};
