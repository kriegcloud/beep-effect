"use client";

import { Iconify } from "@beep/ui/atoms";
import Portal from "@mui/material/Portal";
import { snackbarClasses } from "./classes";
import { SnackbarRoot } from "./styles";

export function Snackbar() {
  return (
    <Portal>
      <SnackbarRoot
        expand
        closeButton
        gap={12}
        offset={16}
        visibleToasts={4}
        position="top-right"
        className={snackbarClasses.root}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: snackbarClasses.toast,
            icon: snackbarClasses.icon,
            loader: snackbarClasses.loader,
            loading: snackbarClasses.loading,

            content: snackbarClasses.content,
            title: snackbarClasses.title,
            description: snackbarClasses.description,

            closeButton: snackbarClasses.closeButton,
            actionButton: snackbarClasses.actionButton,
            cancelButton: snackbarClasses.cancelButton,

            info: snackbarClasses.info,
            error: snackbarClasses.error,
            success: snackbarClasses.success,
            warning: snackbarClasses.warning,
          },
        }}
        icons={{
          loading: <span className={snackbarClasses.loadingIcon} />,
          info: <Iconify className={snackbarClasses.iconSvg} icon="solar:info-circle-bold" />,
          success: <Iconify className={snackbarClasses.iconSvg} icon="solar:check-circle-bold" />,
          warning: <Iconify className={snackbarClasses.iconSvg} icon="solar:danger-triangle-bold" />,
          error: <Iconify className={snackbarClasses.iconSvg} icon="solar:danger-bold" />,
        }}
      />
    </Portal>
  );
}
