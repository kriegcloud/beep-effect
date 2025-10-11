import { Logo } from "@beep/ui/branding";
import { usePathname } from "@beep/ui/hooks";
// import { paths } from "@beep/shared-domain";
import { Scrollbar } from "@beep/ui/molecules";
import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import { useEffect } from "react";
import { SignInButton } from "../../../components/sign-in-button";
import { Nav, NavUl } from "../components";
import type { NavMainProps } from "../types";
import { NavList } from "./nav-mobile-list";

export type NavMobileProps = NavMainProps & {
  open: boolean;
  onClose: () => void;
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
};

export function NavMobile({ data, open, onClose, slots, sx }: NavMobileProps) {
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
          sx: [
            {
              display: "flex",
              flexDirection: "column",
              width: "var(--layout-nav-mobile-width)",
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ],
        },
      }}
    >
      {slots?.topArea ?? (
        <Box
          sx={{
            pt: 3,
            pb: 2,
            pl: 2.5,
            display: "flex",
          }}
        >
          <Logo />
        </Box>
      )}

      <Scrollbar fillContent>
        <Nav
          sx={{
            pb: 3,
            display: "flex",
            flex: "1 1 auto",
            flexDirection: "column",
          }}
        >
          <NavUl>
            {data.map((list) => (
              <NavList key={list.title} data={list} />
            ))}
          </NavUl>
        </Nav>
      </Scrollbar>

      {slots?.bottomArea ?? (
        <Box
          sx={{
            py: 3,
            px: 2.5,
            gap: 1.5,
            display: "flex",
          }}
        >
          <SignInButton fullWidth />

          {/*<Button fullWidth variant="contained" rel="noopener noreferrer" target="_blank" href={paths.minimalStore}>*/}
          {/*  Purchase*/}
          {/*</Button>*/}
        </Box>
      )}
    </Drawer>
  );
}
