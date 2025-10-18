import Tab, { type TabOwnProps, tabClasses } from "@mui/material/Tab";
import type React from "react";

interface AccountTabProps extends TabOwnProps {
  readonly onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
}

export const AccountTab: React.FC<AccountTabProps> = (props) => {
  return (
    <Tab
      {...props}
      sx={{
        px: 3,
        py: 2,
        flexDirection: "row",
        justifyContent: "flex-start",
        gap: 2,
        borderRadius: 2,
        fontWeight: 700,
        color: "text.primary",
        bgcolor: "background.elevation2",
        [`&.${tabClasses.selected}`]: {
          bgcolor: "background.elevation3",
          color: "inherit",
        },
        [`& .${tabClasses.icon}`]: {
          mb: 0,
        },
        maxWidth: 1,
        ...props.sx,
      }}
    />
  );
};
