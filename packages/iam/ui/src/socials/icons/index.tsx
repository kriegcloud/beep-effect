import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import type * as React from "react";
import { Discord } from "./Discord";
import { Github } from "./Github";
import { Google } from "./Google";
import { Linkedin } from "./Linkedin";
import { Twitter } from "./Twitter";

type Props = {
  name: string;
  onClick: () => Promise<void>;
  children: React.ReactNode;
};
export const SocialIcon = ({ children, name, onClick }: Props) => (
  <Tooltip title={name}>
    <Button variant={"outlined"} sx={{ gap: 2 }} onClick={onClick}>
      {children}
    </Button>
  </Tooltip>
);

export const SocialProviderIcons = {
  discord: Discord,
  github: Github,
  twitter: Twitter,
  google: Google,
  linkedin: Linkedin,
} as const;
