import { assetPaths } from "@beep/constants";
import { Box, useTheme } from "@mui/material";

interface VibrantBackgroundProps {
  position?: "top" | "side";
}

export const VibrantBackground = ({ position }: VibrantBackgroundProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={[
        {
          backgroundPositionX: theme.direction === "rtl" ? "right" : "left",
          backgroundPositionY: "top",
          top: 0,
          position: "absolute",
          transform: theme.direction === "rtl" ? "scaleX(-1)" : "none",
          height: "100%",
          width: "100%",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "background.default",
            opacity: 0.8,
          },
        },
        position === "top" && {
          backgroundImage: `url(${assetPaths.assets.images.sections.topbarVibrant})`,
        },
        position === "side" && {
          backgroundImage: `url(${assetPaths.assets.images.sections.sidebarVibrant})`,
        },
      ]}
    />
  );
};
