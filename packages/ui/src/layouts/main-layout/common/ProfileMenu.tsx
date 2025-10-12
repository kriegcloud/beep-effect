"use client";

import { paths } from "@beep/shared-domain";
import { Iconify, type IconifyProps, StatusAvatar } from "@beep/ui/atoms";
import { useThemeMode } from "@beep/ui/hooks";
import { useAuthAdapterProvider, useBreakpoints } from "@beep/ui/providers";
import { useSettingsContext } from "@beep/ui/settings-v2/SettingsProvider";
// import {useRouter} from "next/navigation";
import {
  Box,
  Button,
  Divider,
  Link,
  ListItemIcon,
  listClasses,
  listItemIconClasses,
  MenuItem,
  type MenuItemProps,
  paperClasses,
  Stack,
  Switch,
  type SxProps,
  Typography,
} from "@mui/material";
import Menu from "@mui/material/Menu";
import { type PropsWithChildren, useState } from "react";

interface ProfileMenuProps {
  type?: "default" | "slim";
}

interface ProfileMenuItemProps extends MenuItemProps {
  icon: IconifyProps["icon"];
  href?: string;
  sx?: SxProps;
}

const ProfileMenu = ({ type = "default" }: ProfileMenuProps) => {
  // const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { up } = useBreakpoints();
  const upSm = up("sm");
  const {
    config: { textDirection },
  } = useSettingsContext();

  const { isDark, setThemeMode } = useThemeMode();

  const {
    session: { user },
  } = useAuthAdapterProvider();

  // Use demoUser as fallback if no session user
  // const user = useMemo(() => data?.user || demoUser, [data?.user]);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuButton = (
    <Button
      color="neutral"
      variant="text"
      shape="circle"
      onClick={handleClick}
      sx={[
        {
          height: 44,
          width: 44,
        },
        type === "slim" && {
          height: 30,
          width: 30,
          minWidth: 30,
        },
      ]}
    >
      <StatusAvatar
        alt={user?.name}
        status="online"
        src={user?.image || undefined}
        sx={[
          {
            width: 40,
            height: 40,
            border: 2,
            borderColor: "background.paper",
          },
          type === "slim" && { width: 24, height: 24, border: 1, borderColor: "background.paper" },
        ]}
      />
    </Button>
  );
  return (
    <>
      {type === "slim" && upSm ? (
        <Button color="neutral" variant="text" size="small" onClick={handleClick}>
          {user?.name}
        </Button>
      ) : (
        menuButton
      )}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{
          horizontal: textDirection === "rtl" ? "left" : "right",
          vertical: "top",
        }}
        anchorOrigin={{
          horizontal: textDirection === "rtl" ? "left" : "right",
          vertical: "bottom",
        }}
        sx={{
          [`& .${paperClasses.root}`]: { minWidth: 320 },
          [`& .${listClasses.root}`]: { py: 0 },
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 2,
          }}
        >
          <StatusAvatar
            status="online"
            alt={user?.name}
            src={user?.image || undefined}
            sx={{ width: 48, height: 48 }}
          />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              {user?.name}
            </Typography>
            {user?.role && (
              <Typography
                variant="subtitle2"
                sx={{
                  color: "warning.main",
                }}
              >
                {user?.role}
                <Iconify
                  icon="material-symbols:diamond-rounded"
                  color="warning.main"
                  sx={{ verticalAlign: "text-bottom", ml: 0.5 }}
                />
              </Typography>
            )}
          </Box>
        </Stack>
        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem icon="material-symbols:accessible-forward-rounded" onClick={handleClose}>
            Accessibility
          </ProfileMenuItem>

          <ProfileMenuItem icon="material-symbols:settings-outline" onClick={handleClose}>
            Preferences
          </ProfileMenuItem>

          <ProfileMenuItem onClick={() => setThemeMode()} icon="material-symbols:dark-mode-outline-rounded">
            Dark mode
            <Switch checked={isDark} onChange={() => setThemeMode()} sx={{ ml: "auto" }} />
          </ProfileMenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem icon="material-symbols:manage-accounts-outline-rounded" onClick={handleClose} href="#!">
            Account Settings
          </ProfileMenuItem>
          <ProfileMenuItem icon="material-symbols:question-mark-rounded" onClick={handleClose} href="#!">
            Help Center
          </ProfileMenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          {user ? (
            <ProfileMenuItem
              onClick={async () => {
                // const res = await signOut({
                //   redirect: false,
                //   callbackUrl: paths.defaultLoggedOut,
                // });
                //
                // if (res.url) {
                //   router.push(res.url);
                // }
              }}
              icon="material-symbols:logout-rounded"
            >
              Sign Out
            </ProfileMenuItem>
          ) : (
            <ProfileMenuItem href={paths.auth.signIn} icon="material-symbols:login-rounded">
              Sign In
            </ProfileMenuItem>
          )}
        </Box>
      </Menu>
    </>
  );
};

const ProfileMenuItem = ({ icon, onClick, children, href, sx }: PropsWithChildren<ProfileMenuItemProps>) => {
  const linkProps = href ? { component: Link, href, underline: "none" } : {};
  return (
    <MenuItem onClick={onClick} {...linkProps} sx={{ gap: 1, ...sx }}>
      <ListItemIcon
        sx={{
          [`&.${listItemIconClasses.root}`]: { minWidth: "unset !important" },
        }}
      >
        <Iconify icon={icon} sx={{ color: "text.secondary" }} />
      </ListItemIcon>
      {children}
    </MenuItem>
  );
};

export default ProfileMenu;
