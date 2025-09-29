"use client";
import { Iconify } from "@beep/ui/atoms";
import type { Skin } from "@emoji-mart/data";
import data from "@emoji-mart/data/sets/15/apple.json";
import Picker from "@emoji-mart/react";
import { Button, Popover, Tooltip, useTheme } from "@mui/material";
import React, { type JSX } from "react";

type PickerProps = React.ComponentProps<typeof Picker>;

interface EmojiPickerProps extends PickerProps {
  handleEmojiSelect?: (emoji: string) => void;
  actionButtonEle?: JSX.Element;
}

export const EmojiPicker = ({ handleEmojiSelect, actionButtonEle, ...rest }: EmojiPickerProps) => {
  const [emojiAnchorEl, setEmojiAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const { direction } = useTheme();

  const onEmojiSelect = (emoji: Skin) => {
    if (handleEmojiSelect) {
      handleEmojiSelect(emoji.native);
    }
    setEmojiAnchorEl(null);
  };

  return (
    <>
      <div onClick={(e) => setEmojiAnchorEl(e.currentTarget)}>
        {actionButtonEle ? (
          actionButtonEle
        ) : (
          <Tooltip title="Emoji">
            <Button variant="contained" shape="square" color="primary">
              <Iconify icon="material-symbols:mood-outline-rounded" fontSize={20} />
            </Button>
          </Tooltip>
        )}
      </div>

      <Popover
        open={!!emojiAnchorEl}
        onClose={() => setEmojiAnchorEl(null)}
        anchorEl={emojiAnchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: direction === "rtl" ? "right" : "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: direction === "rtl" ? "right" : "left",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: -2,
            },
          },
        }}
        keepMounted
      >
        <Picker
          data={data}
          perLine={8}
          previewPosition="none"
          skinTonePosition="none"
          theme="light"
          onEmojiSelect={onEmojiSelect}
          {...rest}
        />
      </Popover>
    </>
  );
};
