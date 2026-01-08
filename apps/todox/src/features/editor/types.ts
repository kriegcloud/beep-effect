import type { BoxProps } from "@mui/material/Box";
import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import type { SxProps, Theme } from "@mui/material/styles";
import type { Editor, UseEditorOptions } from "@tiptap/react";

// ----------------------------------------------------------------------

export type EditorProps = UseEditorOptions & {
  readonly value?: undefined | string;
  readonly error?: undefined | boolean;
  readonly fullItem?: undefined | boolean;
  readonly className?: undefined | string;
  readonly sx?: undefined | SxProps<Theme>;
  readonly resetValue?: undefined | boolean;
  readonly placeholder?: undefined | string;
  readonly helperText?: undefined | React.ReactNode;
  readonly onChange?: undefined | ((value: string) => void);
  readonly slotProps?:
    | undefined
    | {
        readonly wrapper?: undefined | BoxProps;
      };
  readonly ref?: undefined | React.RefObject<HTMLDivElement | null> | React.RefCallback<HTMLDivElement | null>;
};

export type EditorToolbarProps = {
  readonly editor: Editor;
  readonly fullscreen: boolean;
  readonly onToggleFullscreen: () => void;
  readonly fullItem?: undefined | EditorProps["fullItem"];
};

export type EditorToolbarItemProps = ButtonBaseProps & {
  readonly label?: undefined | string;
  readonly active?: undefined | boolean;
  readonly icon?: undefined | React.ReactNode;
};
