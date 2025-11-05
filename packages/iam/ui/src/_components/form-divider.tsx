import Divider from "@mui/material/Divider";
import type { SxProps, Theme } from "@mui/material/styles";

type FormDividerProps = {
  readonly sx?: SxProps<Theme> | undefined;
  readonly label?: React.ReactNode | undefined;
};

export function FormDivider({ sx, label = "OR" }: FormDividerProps) {
  return (
    <Divider
      sx={[
        () => ({
          my: 3,
          typography: "overline",
          color: "text.disabled",
          "&::before, :after": { borderTopStyle: "dashed" },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {label}
    </Divider>
  );
}
