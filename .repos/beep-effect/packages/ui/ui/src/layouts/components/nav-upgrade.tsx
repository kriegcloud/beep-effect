import { assetPaths } from "@beep/constants";
import { Label } from "@beep/ui/atoms";
import { useAuthAdapterProvider } from "@beep/ui/providers";
import { rgbaFromChannel } from "@beep/ui-core/utils";
import Avatar from "@mui/material/Avatar";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { m } from "framer-motion";
export function NavUpgrade({ sx, ...other }: BoxProps) {
  const {
    session: { user },
  } = useAuthAdapterProvider();

  return (
    <Box sx={[{ px: 2, py: 5, textAlign: "center" }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
      <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
        <Box sx={{ position: "relative" }}>
          <Avatar src={user?.image ?? ""} alt={user?.name} sx={{ width: 48, height: 48 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>

          <Label
            color="success"
            variant="filled"
            sx={{
              top: -6,
              px: 0.5,
              left: 40,
              height: 20,
              position: "absolute",
              borderBottomLeftRadius: 2,
            }}
          >
            Free
          </Label>
        </Box>

        <Box sx={{ mb: 2, mt: 1.5, width: 1 }}>
          <Typography variant="subtitle2" noWrap sx={{ mb: 1, color: "var(--layout-nav-text-primary-color)" }}>
            {user?.name}
          </Typography>

          <Typography variant="body2" noWrap sx={{ color: "var(--layout-nav-text-disabled-color)" }}>
            {user?.email}
          </Typography>
        </Box>

        <Button variant="contained" href={"/store"} target="_blank" rel="noopener noreferrer">
          Upgrade to Pro
        </Button>
      </Box>
    </Box>
  );
}

export function UpgradeBlock({ sx, ...other }: BoxProps) {
  return (
    <Box
      sx={[
        (theme) => ({
          ...theme.mixins.bgGradient({
            images: [
              `linear-gradient(135deg, ${rgbaFromChannel(theme.vars.palette.error.lightChannel, 0.92)}, ${rgbaFromChannel(theme.vars.palette.secondary.darkChannel, 0.92)})`,
              `url(${assetPaths.assets.background.background7})`,
            ],
          }),
          px: 3,
          py: 4,
          borderRadius: 2,
          position: "relative",
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box
        sx={(theme) => ({
          top: 0,
          left: 0,
          width: 1,
          height: 1,
          borderRadius: 2,
          position: "absolute",
          border: `solid 3px ${rgbaFromChannel(theme.vars.palette.common.whiteChannel, 0.16)}`,
        })}
      />

      <Box
        component={m.img}
        animate={{ y: [12, -12, 12] }}
        transition={{
          duration: 8,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 0,
        }}
        alt="Small Rocket"
        src={assetPaths.assets.illustrations.illustrationRocketSmall}
        sx={{
          right: 0,
          width: 112,
          height: 112,
          position: "absolute",
        }}
      />

      <Box
        sx={{
          display: "flex",
          position: "relative",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Box component="span" sx={{ typography: "h5", color: "common.white" }}>
          35% OFF
        </Box>

        <Box
          component="span"
          sx={{
            mb: 2,
            mt: 0.5,
            color: "common.white",
            typography: "subtitle2",
          }}
        >
          Power up Productivity!
        </Box>

        <Button variant="contained" size="small" color="warning">
          Upgrade to Pro
        </Button>
      </Box>
    </Box>
  );
}
