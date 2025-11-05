import type { BoxProps } from "@mui/material/Box";
import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import type { SxProps, Theme } from "@mui/material/styles";
import type { Editor, EditorOptions } from "@tiptap/react";

export type EditorProps = Partial<EditorOptions> & {
  readonly value?: string | undefined;
  readonly error?: boolean | undefined;
  readonly fullItem?: boolean | undefined;
  readonly className?: string | undefined;
  readonly sx?: SxProps<Theme> | undefined;
  readonly resetValue?: boolean | undefined;
  readonly placeholder?: string | undefined;
  readonly helperText?: React.ReactNode | undefined;
  readonly onChange?: (value: string) => void | undefined;
  readonly slotProps?:
    | {
        readonly wrapper?: BoxProps | undefined;
      }
    | undefined;
  readonly ref?: React.RefObject<HTMLDivElement | null> | React.RefCallback<HTMLDivElement | null> | undefined;
};

export type EditorToolbarProps = {
  readonly fullScreen: boolean;
  readonly editor: Editor | null;
  readonly onToggleFullScreen: () => void;
  readonly fullItem?: EditorProps["fullItem"] | undefined;
};

export type EditorToolbarItemProps = ButtonBaseProps & {
  readonly label?: string | undefined;
  readonly active?: boolean | undefined;
  readonly disabled?: boolean | undefined;
  readonly icon?: React.ReactNode | undefined;
};
