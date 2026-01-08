import { usePopover } from "@beep/ui/hooks";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Editor } from "@tiptap/react";
import { useCallback, useState } from "react";
import { editorClasses } from "../classes";
import type { EditorToolbarItemProps } from "../types";
import { ToolbarItem } from "./toolbar-item";

// ----------------------------------------------------------------------

type ImageBlockProps = Pick<EditorToolbarItemProps, "icon"> & {
  editor: Editor;
};

type ImageFormState = {
  imageUrl: string;
  altText: string;
};

export function ImageBlock({ editor, icon }: ImageBlockProps) {
  const { anchorEl, open, onOpen, onClose } = usePopover();
  const [state, setState] = useState<ImageFormState>({
    imageUrl: "",
    altText: "",
  });

  const handleApply = useCallback(() => {
    onClose();
    setState({ imageUrl: "", altText: "" });
    editor.chain().focus().setImage({ src: state.imageUrl, alt: state.altText }).run();
  }, [editor, onClose, state.altText, state.imageUrl]);

  const popoverId = open ? "image-popover" : undefined;

  return (
    <>
      <ToolbarItem
        aria-describedby={popoverId}
        aria-label="Insert image"
        className={editorClasses.toolbar.image}
        onClick={onOpen}
        icon={icon}
      />

      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              p: 2.5,
              gap: 1.25,
              width: 1,
              maxWidth: 320,
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        <Typography variant="subtitle2">Add image</Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Image URL"
          value={state.imageUrl}
          onChange={(event) => setState((prev) => ({ ...prev, imageUrl: event.target.value }))}
        />

        <TextField
          fullWidth
          size="small"
          placeholder="Alt text"
          value={state.altText}
          onChange={(event) => setState((prev) => ({ ...prev, altText: event.target.value }))}
        />

        <Button variant="contained" disabled={!state.imageUrl} onClick={handleApply} sx={{ alignSelf: "flex-end" }}>
          Apply
        </Button>
      </Popover>
    </>
  );
}
