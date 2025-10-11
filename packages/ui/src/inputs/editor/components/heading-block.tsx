import { Iconify } from "@beep/ui/atoms";
import { rgbaFromChannel } from "@beep/ui-core/utils";
import ButtonBase, { buttonBaseClasses } from "@mui/material/ButtonBase";
import { listClasses } from "@mui/material/List";

import Menu from "@mui/material/Menu";
import type { Level } from "@tiptap/extension-heading";
import React, { useState } from "react";
import type { EditorToolbarProps } from "../types";
import { ToolbarItem } from "./toolbar-item";

const HEADING_OPTIONS = ["Heading 1", "Heading 2", "Heading 3", "Heading 4", "Heading 5", "Heading 6"];

export function HeadingBlock({ editor }: Pick<EditorToolbarProps, "editor">) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!editor) {
    return null;
  }

  return (
    <>
      <ButtonBase
        id="heading-menu-button"
        aria-label="Heading menu button"
        aria-controls={anchorEl ? "heading-menu-button" : undefined}
        aria-haspopup="true"
        aria-expanded={anchorEl ? "true" : undefined}
        onClick={handleClick}
        sx={(theme) => ({
          px: 1,
          width: 120,
          height: 32,
          borderRadius: 0.75,
          typography: "body2",
          justifyContent: "space-between",
          border: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.2)}`,
        })}
      >
        {(editor.isActive("heading", { level: 1 }) && "Heading 1") ||
          (editor.isActive("heading", { level: 2 }) && "Heading 2") ||
          (editor.isActive("heading", { level: 3 }) && "Heading 3") ||
          (editor.isActive("heading", { level: 4 }) && "Heading 4") ||
          (editor.isActive("heading", { level: 5 }) && "Heading 5") ||
          (editor.isActive("heading", { level: 6 }) && "Heading 6") ||
          "Paragraph"}

        <Iconify width={16} icon={anchorEl ? "eva:arrow-ios-upward-fill" : "eva:arrow-ios-downward-fill"} />
      </ButtonBase>

      <Menu
        id={React.useId()}
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
        slotProps={{
          list: { "aria-labelledby": "heading-button" },
          paper: {
            sx: {
              width: 120,
              [`& .${listClasses.root}`]: {
                gap: 0.5,
                display: "flex",
                flexDirection: "column",
              },
              [`& .${buttonBaseClasses.root}`]: {
                px: 1,
                width: 1,
                height: 34,
                borderRadius: 0.75,
                justifyContent: "flex-start",
                "&:hover": { backgroundColor: "action.hover" },
              },
            },
          },
        }}
      >
        <ToolbarItem
          component="li"
          label="Paragraph"
          active={editor.isActive("paragraph")}
          onClick={() => {
            handleClose();
            editor.chain().focus().setParagraph().run();
          }}
        />

        {HEADING_OPTIONS.map((heading, index) => {
          const level = Number(heading.replace("Heading", "").trim()) as Level;

          return (
            <ToolbarItem
              aria-label={heading}
              component="li"
              key={heading}
              label={heading}
              active={editor.isActive("heading", { level })}
              onClick={() => {
                handleClose();
                editor.chain().focus().toggleHeading({ level }).run();
              }}
              sx={{
                ...(heading !== "Paragraph" && {
                  fontSize: 18 - index,
                  fontWeight: "fontWeightBold",
                }),
              }}
            />
          );
        })}
      </Menu>
    </>
  );
}
