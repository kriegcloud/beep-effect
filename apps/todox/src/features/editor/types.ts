import type { BoxProps } from "@mui/material/Box";
import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import type { SxProps, Theme } from "@mui/material/styles";
import type { Editor, UseEditorOptions } from "@tiptap/react";

// ----------------------------------------------------------------------

export type EditorProps = UseEditorOptions & {
  value?: string;
  error?: boolean;
  fullItem?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
  resetValue?: boolean;
  placeholder?: string;
  helperText?: React.ReactNode;
  onChange?: (value: string) => void;
  slotProps?: {
    wrapper?: BoxProps;
  };
  ref?: React.RefObject<HTMLDivElement | null> | React.RefCallback<HTMLDivElement | null>;
};

export type EditorToolbarProps = {
  editor: Editor;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  fullItem?: EditorProps["fullItem"];
};

export type EditorToolbarItemProps = ButtonBaseProps & {
  label?: string;
  active?: boolean;
  icon?: React.ReactNode;
};
