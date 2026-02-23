"use client";

import { mergeClasses } from "@beep/ui-core/utils";
import Tooltip from "@mui/material/Tooltip";
import { CloudArrowDownIcon, XIcon } from "@phosphor-icons/react";
import { fileThumbnailClasses } from "./classes";
import { DownloadButton, RemoveButton, ThumbnailImage, ThumbnailRoot } from "./styles";
import type { FileThumbnailProps } from "./types";
import { useFilePreview } from "./useFilePreview";
import { getFileIcon, getFileMeta } from "./utils";

export function FileThumbnail({
  sx,
  file,
  tooltip,
  onRemove,
  showImage,
  slotProps,
  className,
  onDownload,
  previewUrl: previewUrlProp,
  ...other
}: FileThumbnailProps) {
  const fileMeta = getFileMeta(file);

  const previewEnabled = !previewUrlProp && !!file;
  const { previewUrl } = useFilePreview(previewEnabled ? file : null);

  const imageSrc = previewUrlProp ?? previewUrl;
  const canShowImage = fileMeta.format === "image" && !!showImage && imageSrc;

  const tooltipProps = slotProps?.tooltip;

  const renderImage = () => (
    <ThumbnailImage
      showImage
      alt={fileMeta.name}
      src={imageSrc}
      className={fileThumbnailClasses.img}
      {...slotProps?.img}
    />
  );

  const renderIcon = () => (
    <ThumbnailImage
      alt={fileMeta.name}
      src={getFileIcon(fileMeta.format)}
      className={fileThumbnailClasses.icon}
      {...slotProps?.icon}
    />
  );

  const renderActions = () => (
    <>
      {onRemove && (
        <RemoveButton onClick={onRemove} className={fileThumbnailClasses.removeBtn} {...slotProps?.removeBtn}>
          <XIcon size={12} />
        </RemoveButton>
      )}

      {onDownload && (
        <DownloadButton onClick={onDownload} className={fileThumbnailClasses.downloadBtn} {...slotProps?.downloadBtn}>
          <CloudArrowDownIcon size={24} weight="fill" />
        </DownloadButton>
      )}
    </>
  );

  const renderContent = () => (
    <ThumbnailRoot className={mergeClasses([fileThumbnailClasses.root, className])} sx={sx ?? {}} {...other}>
      {canShowImage ? renderImage() : renderIcon()}
      {renderActions()}
    </ThumbnailRoot>
  );

  if (!file) return null;

  if (!tooltip) return renderContent();

  return (
    <Tooltip
      arrow
      title={fileMeta.name}
      {...tooltipProps}
      slotProps={{
        ...tooltipProps?.slotProps,
        popper: {
          modifiers: [{ name: "offset", options: { offset: [0, -12] } }],
          ...tooltipProps?.slotProps?.popper,
        },
      }}
    >
      {renderContent()}
    </Tooltip>
  );
}
