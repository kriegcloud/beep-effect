import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCallback, useState } from "react";
import { editorClasses } from "../classes";
import type { EditorToolbarItemProps, EditorToolbarProps } from "../types";
import { ToolbarItem } from "./toolbar-item";

type ImageBlockProps = Pick<EditorToolbarProps, "editor"> & Pick<EditorToolbarItemProps, "icon">;

export function ImageBlock({ editor, icon }: ImageBlockProps) {
  const [url, setUrl] = useState("");

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleUpdateUrl = useCallback(() => {
    handleClosePopover();

    if (anchorEl) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [anchorEl, editor, url]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <ToolbarItem aria-label="Image" className={editorClasses.toolbar.image} onClick={handleOpenPopover} icon={icon} />

      <Popover
        id={anchorEl ? "simple-popover" : undefined}
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ paper: { sx: { p: 2.5 } } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          URL
        </Typography>

        <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Enter URL here..."
            value={url}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setUrl(event.target.value);
            }}
            sx={{ width: 240 }}
          />
          <Button variant="contained" onClick={handleUpdateUrl}>
            Apply
          </Button>
        </Box>
      </Popover>
    </>
  );
}
