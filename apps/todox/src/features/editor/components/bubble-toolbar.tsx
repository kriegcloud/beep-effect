import Divider from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { editorClasses } from "../classes";
import { LinkBlock } from "./link-block";
import { toolbarIcons } from "./toolbar-icons";
import { ToolbarItem } from "./toolbar-item";
import { useToolbarState } from "./use-toolbar-state";

// ----------------------------------------------------------------------

type BubbleToolbarProps = React.ComponentProps<typeof ToolbarRoot> & {
  readonly editor: Editor;
};

export function BubbleToolbar({ editor, sx, ...other }: BubbleToolbarProps) {
  const toolbarState = useToolbarState(editor);

  const chainCommands = () => editor.chain().focus();

  return (
    <BubbleMenu editor={editor}>
      <ToolbarRoot sx={sx} {...other}>
        <ToolbarItem
          aria-label="Bold"
          active={toolbarState.isBold}
          className={editorClasses.toolbar.bold}
          onClick={() => chainCommands().toggleBold().run()}
          icon={toolbarIcons.bold}
        />
        <ToolbarItem
          aria-label="Italic"
          active={toolbarState.isItalic}
          className={editorClasses.toolbar.italic}
          onClick={() => chainCommands().toggleItalic().run()}
          icon={toolbarIcons.italic}
        />
        <ToolbarItem
          aria-label="Underline"
          active={toolbarState.isUnderline}
          className={editorClasses.toolbar.underline}
          onClick={() => chainCommands().toggleUnderline().run()}
          icon={toolbarIcons.underline}
        />
        <ToolbarItem
          aria-label="Strike"
          active={toolbarState.isStrike}
          className={editorClasses.toolbar.strike}
          onClick={() => chainCommands().toggleStrike().run()}
          icon={toolbarIcons.strike}
        />
        <LinkBlock
          editor={editor}
          active={toolbarState.isLink}
          linkIcon={toolbarIcons.link}
          unlinkIcon={toolbarIcons.unlink}
        />
        <ToolbarItem
          aria-label="Uppercase"
          active={toolbarState.isTextTransform("uppercase")}
          className={editorClasses.toolbar.clear}
          onClick={() => chainCommands().toggleTextTransform("uppercase").run()}
          icon={toolbarIcons.uppercase}
        />
        <ToolbarItem
          aria-label="Lowercase"
          active={toolbarState.isTextTransform("lowercase")}
          className={editorClasses.toolbar.clear}
          onClick={() => chainCommands().toggleTextTransform("lowercase").run()}
          icon={toolbarIcons.lowercase}
        />
        <ToolbarItem
          aria-label="Capitalize"
          active={toolbarState.isTextTransform("capitalize")}
          className={editorClasses.toolbar.clear}
          onClick={() => chainCommands().toggleTextTransform("capitalize").run()}
          icon={toolbarIcons.capitalize}
        />
        <Divider orientation="vertical" flexItem sx={{ height: 16, my: "auto" }} />
        <ToolbarItem
          aria-label="Clear format"
          className={editorClasses.toolbar.clear}
          onClick={() => chainCommands().clearNodes().unsetAllMarks().run()}
          icon={toolbarIcons.clear}
        />
      </ToolbarRoot>
    </BubbleMenu>
  );
}

// ----------------------------------------------------------------------

const ToolbarRoot = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.vars.customShadows.z8,
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px solid ${theme.vars.palette.shared.paperOutlined}`,
}));
