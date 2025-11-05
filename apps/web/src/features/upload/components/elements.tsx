import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

export const componentBoxStyles: SxProps<Theme> = {
  flexDirection: "column",
  alignItems: "unset",
  justifyContent: "flex-start",
};

type FormActionsProps = BoxProps & {
  readonly loading?: boolean | undefined;
  readonly disabled?: boolean | undefined;
  readonly onReset: () => void;
};

export function FormActions({ sx, disabled, onReset, loading, ...other }: FormActionsProps) {
  return (
    <Box
      sx={[
        () => ({
          mb: 3,
          gap: 2,
          display: "flex",
          justifyContent: "flex-end",
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Button color="error" size="large" disabled={disabled} onClick={onReset}>
        Reset
      </Button>
      <Button size="large" type="submit" variant="contained" loading={loading}>
        Submit to check
      </Button>
    </Box>
  );
}

export function FormGrid({ sx, children, ...other }: BoxProps) {
  return (
    <Box
      sx={[
        () => ({
          rowGap: 5,
          columnGap: 3,
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </Box>
  );
}

type FieldContainerProps = BoxProps & {
  readonly label?: string | undefined;
  readonly children: React.ReactNode;
};

export function FieldContainer({ sx, children, label = "RHFTextField" }: FieldContainerProps) {
  return (
    <Box
      sx={[
        () => ({
          gap: 1,
          width: 1,
          display: "flex",
          flexDirection: "column",
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Typography
        variant="caption"
        sx={[
          (theme) => ({
            textAlign: "right",
            fontStyle: "italic",
            color: "text.disabled",
            fontSize: theme.typography.pxToRem(10),
          }),
        ]}
      >
        {label}
      </Typography>

      {children}
    </Box>
  );
}
