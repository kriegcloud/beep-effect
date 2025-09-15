import type { BoxProps } from "@mui/material/Box";
import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import type { SxProps, Theme } from "@mui/material/styles";
import type { Editor, EditorOptions } from "@tiptap/react";

export type EditorProps = Partial<EditorOptions> & {
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
  fullScreen: boolean;
  editor: Editor | null;
  onToggleFullScreen: () => void;
  fullItem?: EditorProps["fullItem"];
};

export type EditorToolbarItemProps = ButtonBaseProps & {
  label?: string;
  active?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
};
