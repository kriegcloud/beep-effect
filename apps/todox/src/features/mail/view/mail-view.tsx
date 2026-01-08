"use client";

import { useBoolean, usePathname, useRouter, useSearchParams } from "@beep/ui/hooks";
import { DashboardContent } from "@beep/ui/layouts/dashboard";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { startTransition, useCallback, useEffect } from "react";
import { useGetLabels, useGetMail, useGetMails } from "src/actions/mail";
import { MailLayout } from "../layout";
import { MailCompose } from "../mail-compose";
import { MailDetails } from "../mail-details";
import { MailHeader } from "../mail-header";
import { MailList } from "../mail-list";
import { MailNav } from "../mail-nav";

// ----------------------------------------------------------------------

const LABEL_INDEX = "inbox";

export function MailView() {
  const router = useRouter();
  const pathname = usePathname();

  const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

  const searchParams = useSearchParams();
  const selectedLabelId = searchParams.get("label") ?? LABEL_INDEX;
  const selectedMailId = searchParams.get("id") ?? "";

  const openNav = useBoolean();
  const openMail = useBoolean();
  const openCompose = useBoolean();

  const { labels, labelsLoading, labelsEmpty } = useGetLabels();
  const { mail, mailLoading, mailError } = useGetMail(selectedMailId);
  const { mails, mailsLoading, mailsEmpty } = useGetMails(selectedLabelId);

  const firstMailId = mails.allIds[0] || "";

  const handleToggleCompose = useCallback(() => {
    if (openNav.value) {
      openNav.onFalse();
    }
    openCompose.onToggle();
  }, [openCompose, openNav]);

  const handleClickLabel = useCallback(
    (labelId: string) => {
      if (!mdUp) {
        openNav.onFalse();
      }

      const redirectPath = labelId !== LABEL_INDEX ? `${pathname}?label=${labelId}` : pathname;

      if (selectedLabelId !== labelId) {
        startTransition(() => {
          router.push(redirectPath);
        });
      }
    },
    [mdUp, selectedLabelId, openNav, router]
  );

  const handleClickMail = useCallback(
    (mailId: string) => {
      if (!mdUp) {
        openMail.onFalse();
      }

      const redirectPath =
        selectedLabelId !== LABEL_INDEX
          ? `${pathname}?id=${mailId}&label=${selectedLabelId}`
          : `${pathname}?id=${mailId}`;

      if (selectedMailId !== mailId) {
        startTransition(() => {
          router.push(redirectPath);
        });
      }
    },
    [mdUp, openMail, pathname, router, selectedLabelId, selectedMailId]
  );

  useEffect(() => {
    if (!selectedMailId && firstMailId) {
      handleClickMail(firstMailId);
    }
  }, [firstMailId, handleClickMail, selectedMailId]);

  return (
    <>
      <DashboardContent maxWidth={false} sx={{ flex: "1 1 auto", display: "flex", flexDirection: "column" }}>
        <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
          Mail
        </Typography>

        <MailLayout
          sx={{
            p: 1,
            borderRadius: 2,
            flex: "1 1 auto",
            bgcolor: "background.neutral",
          }}
          slots={{
            header: (
              <MailHeader
                onOpenNav={openNav.onTrue}
                onOpenMail={mailsEmpty ? undefined : openMail.onTrue}
                sx={{ display: { md: "none" } }}
              />
            ),
            nav: (
              <MailNav
                labels={labels}
                isEmpty={labelsEmpty}
                loading={labelsLoading}
                openNav={openNav.value}
                onCloseNav={openNav.onFalse}
                selectedLabelId={selectedLabelId}
                onClickLabel={handleClickLabel}
                onToggleCompose={handleToggleCompose}
              />
            ),
            list: (
              <MailList
                mails={mails}
                isEmpty={mailsEmpty}
                loading={mailsLoading}
                openMail={openMail.value}
                onCloseMail={openMail.onFalse}
                onClickMail={handleClickMail}
                selectedLabelId={selectedLabelId}
                selectedMailId={selectedMailId}
              />
            ),
            details: (
              <MailDetails
                mail={mail}
                error={mailError?.message}
                loading={mailsLoading || mailLoading}
                renderLabel={(id: string) => labels.find((label) => label.id === id)}
              />
            ),
          }}
          slotProps={{
            list: {
              sx: [mailsEmpty && { display: "flex", flex: "1 1 auto" }],
            },
            details: {
              sx: [mailsEmpty && { display: "none" }],
            },
          }}
        />
      </DashboardContent>

      {openCompose.value && <MailCompose onCloseCompose={openCompose.onFalse} />}
    </>
  );
}
