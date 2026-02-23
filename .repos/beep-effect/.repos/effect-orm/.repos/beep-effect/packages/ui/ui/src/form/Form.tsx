import Box, { type BoxProps } from "@mui/material/Box";

import Typography from "@mui/material/Typography";
import type * as React from "react";

type FormHeadProps = BoxProps & {
  readonly icon?: React.ReactNode | undefined;
  readonly title: React.ReactNode | undefined;
  readonly description?: React.ReactNode | undefined;
};

export const FormHead: React.FC<FormHeadProps> = ({ children, sx, icon, title, description, ...props }) => {
  return (
    <>
      {icon ? (
        <Box component="span" sx={{ mb: 3, mx: "auto", display: "inline-flex" }}>
          {icon}
        </Box>
      ) : null}
      <Box
        sx={[
          () => ({
            mb: 5,
            gap: 1.5,
            display: "flex",
            textAlign: "center",
            whiteSpace: "pre-line",
            flexDirection: "column",
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      >
        <Typography variant={"h5"}>{title}</Typography>
        {description ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {description}
          </Typography>
        ) : null}
      </Box>
    </>
  );
};

export const FormControl: React.FC<React.ComponentProps<typeof Box>> = ({ children, ...props }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }} {...props}>
    {children}
  </Box>
);

const BoxForm: React.FC<
  React.ComponentProps<"form"> & Omit<React.ComponentProps<typeof Box>, "component" | "onSubmit">
> = (props) => <Box component={"form"} {...props} />;

export const Form: React.FC<React.ComponentProps<typeof BoxForm>> = ({ children, onSubmit, ...props }) => {
  return (
    <BoxForm
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSubmit?.(event);
      }}
      sx={{ display: "flex", flexDirection: "column" }}
      {...props}
    >
      {children}
    </BoxForm>
  );
};
