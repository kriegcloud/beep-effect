import { fileData } from "@beep/ui/atoms";
import { fData, mergeClasses, rgbaFromChannel } from "@beep/ui/utils";
import { styled } from "@mui/material/styles";

import type React from "react";
import type { FileRejection } from "react-dropzone";
import { uploadClasses } from "../classes";

type RejectionFilesProps = React.ComponentProps<typeof ListRoot> & {
  files?: readonly FileRejection[];
};

export function RejectionFiles({ files, sx, className, ...other }: RejectionFilesProps) {
  return (
    <ListRoot className={mergeClasses([uploadClasses.uploadRejectionFiles, className])} sx={sx} {...other}>
      {files?.map(({ file, errors }) => {
        const { path, size } = fileData(file);

        return (
          <ListItem key={path}>
            <ItemTitle>
              {path} - {size ? fData(size) : ""}
            </ItemTitle>

            {errors.map((error) => (
              <ItemCaption key={error.code}>- {error.message}</ItemCaption>
            ))}
          </ListItem>
        );
      })}
    </ListRoot>
  );
}

const ListRoot = styled("ul")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  flexDirection: "column",
  padding: theme.spacing(2),
  marginTop: theme.spacing(3),
  borderRadius: Number(theme.shape.borderRadius),
  border: `dashed 1px ${theme.vars.palette.error.main}`,
  backgroundColor: rgbaFromChannel(theme.vars.palette.error.mainChannel, 0.08),
}));

const ListItem = styled("li")(() => ({
  display: "flex",
  flexDirection: "column",
}));

const ItemTitle = styled("span")(({ theme }) => ({
  ...theme.typography.subtitle2,
}));

const ItemCaption = styled("span")(({ theme }) => ({
  ...theme.typography.caption,
}));
