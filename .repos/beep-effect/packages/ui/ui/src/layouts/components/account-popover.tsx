import { Label } from "@beep/ui/atoms";
import { usePathname, usePopover } from "@beep/ui/hooks";
import { CustomPopover } from "@beep/ui/organisms";
import { useAuthAdapterProvider } from "@beep/ui/providers";
import { RouterLink } from "@beep/ui/routing";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import type { IconButtonProps } from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";

import { AccountButton } from "./account-button";
import { SignOutButton } from "./sign-out-button";

// ----------------------------------------------------------------------

export type AccountPopoverProps = IconButtonProps & {
  readonly data?:
    | {
        readonly label: string;
        readonly href: string;
        readonly icon?: React.ReactNode | undefined;
        readonly info?: React.ReactNode | undefined;
      }[]
    | undefined;
};

export function AccountPopover({ data = [], sx, ...other }: AccountPopoverProps) {
  const pathname = usePathname();

  const { open, anchorEl, onClose, onOpen } = usePopover();

  const {
    session: { user },
  } = useAuthAdapterProvider();

  const renderMenuActions = () => (
    <CustomPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{ paper: { sx: { p: 0, width: 200 } } }}
    >
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Typography variant="subtitle2" noWrap>
          {user?.name}
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
          {user?.email}
        </Typography>
      </Box>

      <Divider sx={{ borderStyle: "dashed" }} />

      <MenuList sx={{ p: 1, my: 1, "& li": { p: 0 } }}>
        {data.map((option) => {
          const rootLabel = pathname.includes("/dashboard") ? "Home" : "Dashboard";
          const rootHref = pathname.includes("/dashboard") ? "/" : "/dashboard";

          return (
            <MenuItem key={option.label}>
              <Link
                component={RouterLink}
                href={option.label === "Home" ? rootHref : option.href}
                color="inherit"
                underline="none"
                onClick={onClose}
                sx={{
                  px: 1,
                  py: 0.75,
                  width: 1,
                  display: "flex",
                  typography: "body2",
                  alignItems: "center",
                  color: "text.secondary",
                  "& svg": { width: 24, height: 24 },
                  "&:hover": { color: "text.primary" },
                }}
              >
                {option.icon}

                <Box component="span" sx={{ ml: 2 }}>
                  {option.label === "Home" ? rootLabel : option.label}
                </Box>

                {option.info && (
                  <Label color="error" sx={{ ml: 1 }}>
                    {option.info}
                  </Label>
                )}
              </Link>
            </MenuItem>
          );
        })}
      </MenuList>

      <Divider sx={{ borderStyle: "dashed" }} />

      <Box sx={{ p: 1 }}>
        <SignOutButton size="medium" variant="text" onClose={onClose} sx={{ display: "block", textAlign: "left" }} />
      </Box>
    </CustomPopover>
  );

  return (
    <>
      <AccountButton onClick={onOpen} photoURL={user?.image ?? ""} displayName={user?.name} sx={sx ?? {}} {...other} />

      {renderMenuActions()}
    </>
  );
}
