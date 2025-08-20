import { createClasses } from "@beep/ui/theme/create-classes";
import { mergeClasses } from "@beep/ui/utils";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import type React from "react";

export type UploadPlaceholderProps = React.ComponentProps<"div"> & {
  sx?: SxProps<Theme>;
};

const uploadPlaceholderClasses = {
  root: createClasses("upload__placeholder__root"),
  content: createClasses("upload__placeholder__content"),
  title: createClasses("upload__placeholder__title"),
  description: createClasses("upload__placeholder__description"),
};

export function UploadPlaceholder({
  sx,
  className,
  ...other
}: UploadPlaceholderProps) {
  return (
    <PlaceholderRoot
      className={mergeClasses([uploadPlaceholderClasses.root, className])}
      sx={sx}
      {...other}
    >
      <Box sx={{ width: 200 }} />
      <PlaceholderContent>
        <div className={uploadPlaceholderClasses.title}>
          Drop or select file
        </div>
        <div className={uploadPlaceholderClasses.description}>
          Drop files here or click to
          <span>browse</span>
          through your machine.
        </div>
      </PlaceholderContent>
    </PlaceholderRoot>
  );
}

const PlaceholderRoot = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  justifyContent: "center",
}));

const PlaceholderContent = styled("div")(({ theme }) => ({
  display: "flex",
  textAlign: "center",
  gap: theme.spacing(1),
  flexDirection: "column",
  [`& .${uploadPlaceholderClasses.title}`]: { ...theme.typography.h6 },
  [`& .${uploadPlaceholderClasses.description}`]: {
    ...theme.typography.body2,
    color: theme.vars.palette.text.secondary,
    "& span": {
      textDecoration: "underline",
      margin: theme.spacing(0, 0.5),
      color: theme.vars.palette.primary.main,
    },
  },
}));
