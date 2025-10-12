"use client";

import { Iconify } from "@beep/ui/atoms";
import { Box, Typography } from "@mui/material";

import { useState } from "react";

interface SettingsItemProps {
  label: string;
  image: string;
  active?: boolean;
}

const hoverStyle = {
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    height: 1,
    width: 1,
    bgcolor: "primary.main",
    borderRadius: 1,
    mixBlendMode: "overlay",
    zIndex: 2,
  },
};

const SettingsItem = ({ label, image, active }: SettingsItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      className="SettingsItem"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={[
        {
          bgcolor: "none",
          position: "relative",
        },
      ]}
    >
      <Box
        sx={[
          (!!active || isHovered) && hoverStyle,
          {
            height: 92,
            position: "relative",
            mb: 1,
            backgroundColor: "transparent",
          },
        ]}
      >
        <Box
          component="img"
          src={image}
          alt=""
          draggable={false}
          sx={{ height: 1, width: 1, display: "block", borderRadius: 1 }}
        />
      </Box>

      {active && (
        <Iconify
          icon="material-symbols:check-circle-rounded"
          sx={{
            color: "primary.main",
            fontSize: 24,
            position: "absolute",
            top: 8,
            right: 8,
          }}
        />
      )}
      <Typography
        variant="subtitle2"
        sx={{
          textAlign: "center",
          color: active || isHovered ? "primary.main" : "text.secondary",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export default SettingsItem;
