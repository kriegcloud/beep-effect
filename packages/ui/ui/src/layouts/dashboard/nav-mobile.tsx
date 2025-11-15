import { Logo } from "@beep/ui/branding";
import { usePathname } from "@beep/ui/hooks";
import { Scrollbar } from "@beep/ui/molecules";
import type { NavSectionProps } from "@beep/ui/routing";
import { NavSectionVertical } from "@beep/ui/routing";
import { mergeClasses } from "@beep/ui-core/utils";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { useEffect } from "react";
import { NavUpgrade } from "../components/nav-upgrade";
import { layoutClasses } from "../core";

type NavMobileProps = NavSectionProps & {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly slots?:
    | {
        readonly topArea?: React.ReactNode | undefined;
        readonly bottomArea?: React.ReactNode | undefined;
      }
    | undefined;
};

export function NavMobile({ sx, data, open, slots, onClose, className, checkPermissions, ...other }: NavMobileProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className: mergeClasses([layoutClasses.nav.root, layoutClasses.nav.vertical, className]),
          sx: [
            {
              overflow: "unset",
              bgcolor: "var(--layout-nav-bg)",
              width: "var(--layout-nav-mobile-width)",
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ],
        },
      }}
    >
      {slots?.topArea ?? (
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
          <Logo />
        </Box>
      )}

      <Scrollbar fillContent>
        <NavSectionVertical
          data={data}
          checkPermissions={checkPermissions}
          sx={{ px: 2, flex: "1 1 auto" }}
          {...other}
        />
        <NavUpgrade />
      </Scrollbar>

      {slots?.bottomArea}
    </Drawer>
  );
}
