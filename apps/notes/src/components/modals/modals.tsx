"use client";

import { LoginModal } from "@beep/notes/components/auth/login-modal";
import { VersionHistoryModal } from "@beep/notes/components/editor/version-history/version-history-modal";
import { ConfirmModal } from "@beep/notes/components/modals/confirm-modal";
import { DiscardModal } from "@beep/notes/components/modals/discard-modal";
import { createPushModal } from "@beep/notes/components/modals/push-modal";
import { useAppSet, useAppState, useAppValue } from "@beep/notes/components/providers/app-provider";
import { AlertDialog } from "@beep/notes/components/ui/alert-dialog";
import { useMounted } from "@beep/notes/registry/hooks/use-mounted";
import { useEffect } from "react";

import { ExportDialog } from "../navbar/export-dialog";
import { ImportDialog } from "../navbar/import-dialog";
import { SettingsModal } from "../settings/settings-modal";

export const { ModalProvider, popAllModals, popModal, pushModal, useOnPushModal } = createPushModal({
  modals: {
    Confirm: { Component: ConfirmModal, Wrapper: AlertDialog as any },
    Discard: { Component: DiscardModal, Wrapper: AlertDialog as any },
    Export: ExportDialog,
    Import: ImportDialog,
    Login: LoginModal,
    Settings: SettingsModal,
    VersionHistory: VersionHistoryModal,
  },
});

export const StaticModalProvider = () => {
  const isStatic = useAppValue("isStatic");

  if (!isStatic) return null;

  return <ModalProvider />;
};

function DynamicModal() {
  const mounted = useMounted();
  const setIsDynamic = useAppSet("isDynamic");

  useEffect(() => {
    if (mounted) {
      setIsDynamic(true);
    }
  }, [mounted, setIsDynamic]);

  return <ModalProvider />;
}

export const DynamicModalProvider = () => {
  const [isStatic, setIsStatic] = useAppState("isStatic");

  useEffect(() => {
    setIsStatic(false);
  }, [setIsStatic]);

  if (isStatic) return null;

  return <DynamicModal />;
};
