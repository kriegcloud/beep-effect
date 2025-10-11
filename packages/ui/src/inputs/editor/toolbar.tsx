import { rgbaFromChannel } from "@beep/ui-core/utils";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import type { StackProps } from "@mui/material/Stack";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";
import { editorClasses } from "./classes";
import { HeadingBlock } from "./components/heading-block";
import { ImageBlock } from "./components/image-block";
import { LinkBlock } from "./components/link-block";
import { ToolbarItem } from "./components/toolbar-item";
import { toolbarIcons } from "./icons";
import type { EditorToolbarProps } from "./types";

export function Toolbar({
  sx,
  editor,
  fullItem,
  fullScreen,
  onToggleFullScreen,
  ...other
}: StackProps & EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  const boxStyles: SxProps<Theme> = {
    gap: 0.5,
    display: "flex",
  };

  return (
    <Stack
      className={editorClasses.toolbar.root}
      divider={<Divider orientation="vertical" flexItem sx={{ height: 16, my: "auto" }} />}
      sx={[
        (theme) => ({
          gap: 1,
          p: 1.25,
          flexWrap: "wrap",
          flexDirection: "row",
          alignItems: "center",
          bgcolor: "background.paper",
          borderTopLeftRadius: "inherit",
          borderTopRightRadius: "inherit",
          borderBottom: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.2)}`,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <HeadingBlock editor={editor} />

      {/* Text style */}
      <Box sx={{ ...boxStyles }}>
        <ToolbarItem
          aria-label="Bold"
          active={editor.isActive("bold")}
          className={editorClasses.toolbar.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={toolbarIcons.bold}
        />
        <ToolbarItem
          aria-label="Italic"
          active={editor.isActive("italic")}
          className={editorClasses.toolbar.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={toolbarIcons.italic}
        />
        <ToolbarItem
          aria-label="Underline"
          active={editor.isActive("underline")}
          className={editorClasses.toolbar.underline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          icon={toolbarIcons.underline}
        />
        <ToolbarItem
          aria-label="Strike"
          active={editor.isActive("strike")}
          className={editorClasses.toolbar.italic}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          icon={toolbarIcons.strike}
        />
      </Box>

      {/* List */}
      <Box sx={{ ...boxStyles }}>
        <ToolbarItem
          aria-label="Bullet list"
          active={editor.isActive("bulletList")}
          className={editorClasses.toolbar.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={toolbarIcons.bulletList}
        />
        <ToolbarItem
          aria-label="Ordered list"
          active={editor.isActive("orderedList")}
          className={editorClasses.toolbar.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={toolbarIcons.orderedList}
        />
      </Box>

      {/* Text align */}
      <Box sx={{ ...boxStyles }}>
        <ToolbarItem
          aria-label="Align left"
          active={editor.isActive({ textAlign: "left" })}
          className={editorClasses.toolbar.alignLeft}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          icon={toolbarIcons.alignLeft}
        />
        <ToolbarItem
          aria-label="Align center"
          active={editor.isActive({ textAlign: "center" })}
          className={editorClasses.toolbar.alignCenter}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          icon={toolbarIcons.alignCenter}
        />
        <ToolbarItem
          aria-label="Align right"
          active={editor.isActive({ textAlign: "right" })}
          className={editorClasses.toolbar.alignRight}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          icon={toolbarIcons.alignRight}
        />
        <ToolbarItem
          aria-label="Align justify"
          active={editor.isActive({ textAlign: "justify" })}
          className={editorClasses.toolbar.alignJustify}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          icon={toolbarIcons.alignJustify}
        />
      </Box>

      {/* Code - Code block */}
      {fullItem && (
        <Box sx={{ ...boxStyles }}>
          <ToolbarItem
            aria-label="Code"
            active={editor.isActive("code")}
            className={editorClasses.toolbar.code}
            onClick={() => editor.chain().focus().toggleCode().run()}
            icon={toolbarIcons.code}
          />
          <ToolbarItem
            aria-label="Code block"
            active={editor.isActive("codeBlock")}
            className={editorClasses.toolbar.codeBlock}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            icon={toolbarIcons.codeBlock}
          />
        </Box>
      )}

      {/* Blockquote - Hr line */}
      {fullItem && (
        <Box sx={{ ...boxStyles }}>
          <ToolbarItem
            aria-label="Blockquote"
            active={editor.isActive("blockquote")}
            className={editorClasses.toolbar.blockquote}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            icon={toolbarIcons.blockquote}
          />
          <ToolbarItem
            aria-label="Horizontal"
            className={editorClasses.toolbar.hr}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            icon={toolbarIcons.horizontal}
          />
        </Box>
      )}

      {/* Link - Image */}
      <Box sx={{ ...boxStyles }}>
        <LinkBlock
          editor={editor}
          icons={{
            link: toolbarIcons.link,
            unsetLink: toolbarIcons.unsetLink,
          }}
        />
        <ImageBlock editor={editor} icon={toolbarIcons.image} />
      </Box>

      {/* HardBreak - Clear */}
      <Box sx={{ ...boxStyles }}>
        <ToolbarItem
          aria-label="HardBreak"
          onClick={() => editor.chain().focus().setHardBreak().run()}
          className={editorClasses.toolbar.hardbreak}
          icon={toolbarIcons.hardbreak}
        />
        <ToolbarItem
          aria-label="Clear"
          className={editorClasses.toolbar.clear}
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          icon={toolbarIcons.clear}
        />
      </Box>

      {/* Undo - Redo */}
      {fullItem && (
        <Box sx={{ ...boxStyles }}>
          <ToolbarItem
            aria-label="Undo"
            className={editorClasses.toolbar.undo}
            disabled={!editor.can().chain().focus().undo().run()}
            onClick={() => editor.chain().focus().undo().run()}
            icon={toolbarIcons.undo}
          />
          <ToolbarItem
            aria-label="Redo"
            className={editorClasses.toolbar.redo}
            disabled={!editor.can().chain().focus().redo().run()}
            onClick={() => editor.chain().focus().redo().run()}
            icon={toolbarIcons.redo}
          />
        </Box>
      )}

      <Box sx={{ ...boxStyles }}>
        <ToolbarItem
          aria-label="Fullscreen"
          active={fullScreen}
          className={editorClasses.toolbar.fullscreen}
          onClick={onToggleFullScreen}
          icon={fullScreen ? toolbarIcons.fullScreen : toolbarIcons.exitFullScreen}
        />
      </Box>
    </Stack>
  );
}
