import { rgbaFromChannel } from "@beep/ui-core/utils";
import Divider from "@mui/material/Divider";
import type { StackProps } from "@mui/material/Stack";

import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import { editorClasses } from "../classes";
import type { EditorToolbarProps } from "../types";
import { HeadingBlock } from "./heading-block";
import { ImageBlock } from "./image-block";
import { LinkBlock } from "./link-block";
import { toolbarIcons } from "./toolbar-icons";
import { ToolbarItem } from "./toolbar-item";
import { useToolbarState } from "./use-toolbar-state";

// ----------------------------------------------------------------------

export function Toolbar({
  sx,
  editor,
  fullItem,
  fullscreen,
  onToggleFullscreen,
  ...other
}: StackProps & EditorToolbarProps) {
  const toolbarState = useToolbarState(editor);

  const chainCommands = () => editor.chain().focus();

  return (
    <ToolbarRoot
      className={editorClasses.toolbar.root}
      divider={<Divider orientation="vertical" flexItem sx={{ height: 16, my: "auto" }} />}
      sx={sx}
      {...other}
    >
      <HeadingBlock editor={editor} isActive={toolbarState.isTextLevel} />

      {/* Text styles */}
      <ToolbarBlock>
        <ToolbarItem
          aria-label="Bold (⌘B)"
          active={toolbarState.isBold}
          className={editorClasses.toolbar.bold}
          onClick={() => chainCommands().toggleBold().run()}
          icon={toolbarIcons.bold}
        />
        <ToolbarItem
          aria-label="Italic (⌘I)"
          active={toolbarState.isItalic}
          className={editorClasses.toolbar.italic}
          onClick={() => chainCommands().toggleItalic().run()}
          icon={toolbarIcons.italic}
        />
        <ToolbarItem
          aria-label="Underline (⌘U)"
          active={toolbarState.isUnderline}
          className={editorClasses.toolbar.underline}
          onClick={() => chainCommands().toggleUnderline().run()}
          icon={toolbarIcons.underline}
        />
        <ToolbarItem
          aria-label="Strike (⌘S)"
          active={toolbarState.isStrike}
          className={editorClasses.toolbar.strike}
          onClick={() => chainCommands().toggleStrike().run()}
          icon={toolbarIcons.strike}
        />
      </ToolbarBlock>

      {/* Lists */}
      <ToolbarBlock>
        <ToolbarItem
          aria-label="Bullet list (⌘⇧8)"
          active={toolbarState.isBulletList}
          className={editorClasses.toolbar.bulletList}
          onClick={() => chainCommands().toggleBulletList().run()}
          icon={toolbarIcons.bulletList}
        />
        <ToolbarItem
          aria-label="Ordered list (⌘⇧7)"
          active={toolbarState.isOrderedList}
          className={editorClasses.toolbar.orderedList}
          onClick={() => chainCommands().toggleOrderedList().run()}
          icon={toolbarIcons.orderedList}
        />
      </ToolbarBlock>

      {/* Text alignment */}
      <ToolbarBlock>
        <ToolbarItem
          aria-label="Align left (⌘⇧L)"
          active={toolbarState.isAlign("left")}
          className={editorClasses.toolbar.alignLeft}
          onClick={() => chainCommands().toggleTextAlign("left").run()}
          icon={toolbarIcons.alignLeft}
        />
        <ToolbarItem
          aria-label="Align center (⌘⇧E)"
          active={toolbarState.isAlign("center")}
          className={editorClasses.toolbar.alignCenter}
          onClick={() => chainCommands().toggleTextAlign("center").run()}
          icon={toolbarIcons.alignCenter}
        />
        <ToolbarItem
          aria-label="Align right (⌘⇧R)"
          active={toolbarState.isAlign("right")}
          className={editorClasses.toolbar.alignRight}
          onClick={() => chainCommands().toggleTextAlign("right").run()}
          icon={toolbarIcons.alignRight}
        />
        <ToolbarItem
          aria-label="Align justify (⌘⇧J)"
          active={toolbarState.isAlign("justify")}
          className={editorClasses.toolbar.alignJustify}
          onClick={() => chainCommands().toggleTextAlign("justify").run()}
          icon={toolbarIcons.alignJustify}
        />
      </ToolbarBlock>

      {/* Code - Code block */}
      {fullItem && (
        <ToolbarBlock>
          <ToolbarItem
            aria-label="Code (⌘E)"
            active={toolbarState.isCode}
            className={editorClasses.toolbar.code}
            onClick={() => chainCommands().toggleCode().run()}
            icon={toolbarIcons.code}
          />
          <ToolbarItem
            aria-label="Code block (⌘⌥C)"
            active={toolbarState.isCodeBlock}
            className={editorClasses.toolbar.codeBlock}
            onClick={() => chainCommands().toggleCodeBlock().run()}
            icon={toolbarIcons.codeBlock}
          />
        </ToolbarBlock>
      )}

      {/* Blockquote - Horizontal rule */}
      {fullItem && (
        <ToolbarBlock>
          <ToolbarItem
            aria-label="Blockquote (⌘⇧B)"
            active={toolbarState.isBlockquote}
            className={editorClasses.toolbar.blockquote}
            onClick={() => chainCommands().toggleBlockquote().run()}
            icon={toolbarIcons.blockquote}
          />
          <ToolbarItem
            aria-label="Horizontal rule"
            className={editorClasses.toolbar.hr}
            onClick={() => chainCommands().setHorizontalRule().run()}
            icon={toolbarIcons.horizontalRule}
          />
        </ToolbarBlock>
      )}

      {/* Link - Image */}
      <ToolbarBlock>
        <LinkBlock
          editor={editor}
          active={toolbarState.isLink}
          linkIcon={toolbarIcons.link}
          unlinkIcon={toolbarIcons.unlink}
        />
        <ImageBlock editor={editor} icon={toolbarIcons.image} />
      </ToolbarBlock>

      {/* Hard break - Clear format */}
      <ToolbarBlock>
        <ToolbarItem
          aria-label="Hard break (⇧Enter)"
          className={editorClasses.toolbar.hardBreak}
          onClick={() => chainCommands().setHardBreak().run()}
          icon={toolbarIcons.hardBreak}
        />
        <ToolbarItem
          aria-label="Clear format (⌘⇧X)"
          className={editorClasses.toolbar.clear}
          onClick={() => chainCommands().clearNodes().unsetAllMarks().run()}
          icon={toolbarIcons.clear}
        />
      </ToolbarBlock>

      {/* Undo - Redo */}
      {fullItem && (
        <ToolbarBlock>
          <ToolbarItem
            aria-label="Undo (⌘Z)"
            disabled={!toolbarState.canUndo}
            className={editorClasses.toolbar.undo}
            onClick={() => chainCommands().undo().run()}
            icon={toolbarIcons.undo}
          />
          <ToolbarItem
            aria-label="Redo (⌘⇧Z)"
            disabled={!toolbarState.canRedo}
            className={editorClasses.toolbar.redo}
            onClick={() => chainCommands().redo().run()}
            icon={toolbarIcons.redo}
          />
        </ToolbarBlock>
      )}

      {/* Fullscreen */}
      <ToolbarBlock>
        <ToolbarItem
          aria-label="Fullscreen"
          active={fullscreen}
          className={editorClasses.toolbar.fullscreen}
          onClick={onToggleFullscreen}
          icon={fullscreen ? toolbarIcons.fullscreen : toolbarIcons.exitFullscreen}
        />
      </ToolbarBlock>
    </ToolbarRoot>
  );
}

// ----------------------------------------------------------------------

const ToolbarRoot = styled(Stack)(({ theme }) => ({
  flexWrap: "wrap",
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1.25),
  borderTopLeftRadius: "inherit",
  borderTopRightRadius: "inherit",
  backgroundColor: theme.vars.palette.background.paper,
  borderBottom: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.2)}`,
}));

const ToolbarBlock = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));
