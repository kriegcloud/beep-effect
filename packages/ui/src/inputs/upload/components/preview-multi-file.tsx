import { Iconify } from "@beep/ui/atoms";
import { FileThumbnail, fileData } from "@beep/ui/atoms/file-thumbnail";
import { fData, mergeClasses, rgbaFromChannel } from "@beep/ui/utils";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";
import { uploadClasses } from "../classes";

import type { MultiFilePreviewProps } from "../types";

export function MultiFilePreview({
  sx,
  onRemove,
  lastNode,
  thumbnail,
  slotProps,
  firstNode,
  files = [],
  className,
  ...other
}: MultiFilePreviewProps) {
  return (
    <ListRoot
      thumbnail={thumbnail}
      className={mergeClasses([uploadClasses.uploadMultiPreview, className])}
      sx={sx}
      {...other}
    >
      {firstNode && <ItemNode thumbnail={thumbnail}>{firstNode}</ItemNode>}

      {files.map((file) => {
        const { name, size } = fileData(file);

        if (thumbnail) {
          return (
            <ItemThumbnail key={name}>
              <FileThumbnail
                tooltip
                imageView
                file={file}
                onRemove={() => onRemove?.(file)}
                sx={[
                  (theme) => ({
                    width: 80,
                    height: 80,
                    border: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.16)}`,
                  }),
                ]}
                slotProps={{ icon: { sx: { width: 36, height: 36 } } }}
                {...slotProps?.thumbnail}
              />
            </ItemThumbnail>
          );
        }

        return (
          <ItemRow key={name}>
            <FileThumbnail file={file} {...slotProps?.thumbnail} />

            <ListItemText
              primary={name}
              secondary={fData(size)}
              slotProps={{
                secondary: { sx: { typography: "caption" } },
              }}
            />

            {onRemove && (
              <IconButton size="small" onClick={() => onRemove(file)}>
                <Iconify width={16} icon="mingcute:close-line" />
              </IconButton>
            )}
          </ItemRow>
        );
      })}

      {lastNode && <ItemNode thumbnail={thumbnail}>{lastNode}</ItemNode>}
    </ListRoot>
  );
}

const ListRoot = styled("ul", {
  shouldForwardProp: (prop: string) => !["thumbnail", "sx"].includes(prop),
})<Pick<MultiFilePreviewProps, "thumbnail">>(({ thumbnail, theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  flexDirection: "column",
  ...(thumbnail && { flexWrap: "wrap", flexDirection: "row" }),
}));

const ItemThumbnail = styled("li")(() => ({ display: "inline-flex" }));

const ItemRow = styled("li")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, 1, 1, 1.5),
  borderRadius: Number(theme.shape.borderRadius),
  border: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.16)}`,
}));

const ItemNode = styled("li", {
  shouldForwardProp: (prop: string) => !["thumbnail", "sx"].includes(prop),
})<Pick<MultiFilePreviewProps, "thumbnail">>(({ thumbnail }) => ({
  ...(thumbnail && { width: "auto", display: "inline-flex" }),
}));
