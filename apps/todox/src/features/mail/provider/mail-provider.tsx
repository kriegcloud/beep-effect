"use client";

import type { IMail, IMailLabel, IMails } from "@beep/mock/_mail";
import { useGetLabels, useGetMail, useGetMails } from "@beep/todox/actions/mail";
import { type UseBooleanReturn, useBoolean } from "@beep/ui/hooks/use-boolean";
import { usePathname } from "@beep/ui/hooks/use-pathname";
import { useRouter } from "@beep/ui/hooks/use-router";
import { useSearchParams } from "@beep/ui/hooks/use-search-params";
import useMediaQuery from "@mui/material/useMediaQuery";
import * as React from "react";
import { startTransition, useCallback, useEffect, useMemo } from "react";

const LABEL_INDEX = "inbox";

// ============================================================================
// MailProvider - Manages mail state and navigation
// ============================================================================

type MailContextValue = {
  readonly selectedLabelId: string;
  readonly selectedMailId: string;
  readonly openNav: UseBooleanReturn;
  readonly openMail: UseBooleanReturn;
  readonly openCompose: UseBooleanReturn;
  readonly labels: IMailLabel[];
  readonly labelsLoading: boolean;
  readonly labelsEmpty: boolean;
  readonly mails: IMails;
  readonly mailsLoading: boolean;
  readonly mailsEmpty: boolean;
  readonly mail: IMail | undefined;
  readonly mailLoading: boolean;
  readonly mailError: Error | undefined;
  readonly mdUp: boolean;
  readonly handleToggleCompose: () => void;
  readonly handleClickLabel: (labelId: string) => void;
  readonly handleClickMail: (mailId: string) => void;
};

const MailContext = React.createContext<MailContextValue | null>(null);

function useMail() {
  const context = React.useContext(MailContext);
  if (!context) {
    throw new Error("useMail must be used within a MailProvider.");
  }
  return context;
}

interface MailProviderProps {
  readonly children: React.ReactNode;
}

function MailProvider({ children }: MailProviderProps) {
  // Router hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derived state from URL
  const selectedLabelId = searchParams.get("label") ?? LABEL_INDEX;
  const selectedMailId = searchParams.get("id") ?? "";

  // Boolean states for UI controls
  const openNav = useBoolean();
  const openMail = useBoolean();
  const openCompose = useBoolean();

  // Data fetching
  const { labels, labelsLoading, labelsEmpty } = useGetLabels();
  const { mails, mailsLoading, mailsEmpty } = useGetMails(selectedLabelId);
  const { mail, mailLoading, mailError } = useGetMail(selectedMailId);

  // Derived values
  const firstMailId = mails.allIds[0] || "";
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

  // Callbacks
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
    [mdUp, selectedLabelId, openNav, router, pathname]
  );

  const handleClickMail = useCallback(
    (mailId: string) => {
      if (!mdUp) {
        openMail.onTrue();
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

  // Auto-select first mail when none selected
  useEffect(() => {
    if (!selectedMailId && firstMailId) {
      handleClickMail(firstMailId);
    }
  }, [firstMailId, handleClickMail, selectedMailId]);

  const contextValue = useMemo<MailContextValue>(
    () => ({
      selectedLabelId,
      selectedMailId,
      openNav,
      openMail,
      openCompose,
      labels,
      labelsLoading,
      labelsEmpty,
      mails,
      mailsLoading,
      mailsEmpty,
      mail,
      mailLoading,
      mailError,
      mdUp,
      handleToggleCompose,
      handleClickLabel,
      handleClickMail,
    }),
    [
      selectedLabelId,
      selectedMailId,
      openNav,
      openMail,
      openCompose,
      labels,
      labelsLoading,
      labelsEmpty,
      mails,
      mailsLoading,
      mailsEmpty,
      mail,
      mailLoading,
      mailError,
      mdUp,
      handleToggleCompose,
      handleClickLabel,
      handleClickMail,
    ]
  );

  return <MailContext.Provider value={contextValue}>{children}</MailContext.Provider>;
}

export { MailProvider, useMail, type MailContextValue };
