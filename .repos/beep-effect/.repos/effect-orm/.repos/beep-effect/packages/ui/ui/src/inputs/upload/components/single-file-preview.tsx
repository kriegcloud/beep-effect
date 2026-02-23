import { getFileMeta, useFilePreview } from "@beep/ui/atoms";

import { mergeClasses } from "@beep/ui-core/utils";

import { styled } from "@mui/material/styles";

import { uploadClasses } from "../classes";
import type { FileUploadType } from "../types";

export type SingleFilePreviewProps = React.ComponentProps<typeof PreviewRoot> & {
  readonly file: FileUploadType;
};

export function SingleFilePreview({ sx, file, className, ...other }: SingleFilePreviewProps) {
  const fileMeta = getFileMeta(file);
  const { previewUrl } = useFilePreview(file);

  return (
    <PreviewRoot className={mergeClasses([uploadClasses.preview.single, className])} sx={sx ?? {}} {...other}>
      {previewUrl && <PreviewImage alt={fileMeta.name} src={previewUrl} />}
    </PreviewRoot>
  );
}

const PreviewRoot = styled("div")(({ theme }) => ({
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  position: "absolute",
  borderRadius: "inherit",
  padding: theme.spacing(1),
}));

const PreviewImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "inherit",
});
