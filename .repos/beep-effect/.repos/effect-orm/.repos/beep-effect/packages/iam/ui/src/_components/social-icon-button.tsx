import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import type * as React from "react";

type Props = {
  name: string;
  onClick: () => Promise<void>;
  children: React.ReactNode;
};
export const SocialIconButton = ({ children, name, onClick }: Props) => (
  <Tooltip title={name}>
    <Button variant={"outlined"} sx={{ gap: 2 }} onClick={onClick}>
      {children}
    </Button>
  </Tooltip>
);
