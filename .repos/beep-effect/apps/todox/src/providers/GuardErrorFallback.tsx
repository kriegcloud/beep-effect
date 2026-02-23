"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type React from "react";

type Action = {
  readonly label: string;
  readonly onClick: () => void;
  readonly variant?: "contained" | "outlined" | "text" | undefined;
};

type GuardErrorFallbackProps = {
  readonly title: string;
  readonly description: string;
  readonly primaryAction: Action;
  readonly secondaryAction?: Action | undefined;
};

export const GuardErrorFallback: React.FC<GuardErrorFallbackProps> = ({
  title,
  description,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        minHeight: "100%",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        py: 6,
      }}
    >
      <Stack spacing={3} sx={{ maxWidth: 420, textAlign: "center" }}>
        <Typography variant="h5" color="text.primary">
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ flexWrap: "wrap" }}>
          <Button variant={primaryAction.variant ?? "contained"} onClick={primaryAction.onClick}>
            {primaryAction.label}
          </Button>
          {secondaryAction ? (
            <Button variant={secondaryAction.variant ?? "text"} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
};
