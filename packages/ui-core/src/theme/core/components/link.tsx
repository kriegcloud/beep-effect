import type { Theme } from "@mui/material";
import type { Components } from "@mui/material/styles";
import Link from "next/link";
import type { MouseEvent } from "react";

interface LinkBehaviorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly href: string;
  readonly ref?: React.Ref<HTMLAnchorElement> | undefined;
}

export const LinkBehavior = ({ ref, href, onClick, ...props }: LinkBehaviorProps) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (href === "#!") event.preventDefault();
    onClick?.(event);
  };

  return <Link ref={ref} {...props} href={href || "/"} onClick={handleClick} passHref />;
};

export const HashLinkBehavior = ({ ref, href, ...props }: LinkBehaviorProps) => {
  return <Link ref={ref} {...props} href={href} passHref />;
};

const MuiLink: Components<Omit<Theme, "components">>["MuiLink"] = {
  defaultProps: {
    component: LinkBehavior,
    underline: "hover",
  },
  styleOverrides: {
    underlineHover: () => ({
      position: "relative",
      backgroundImage: `linear-gradient(currentcolor, currentcolor)`,
      backgroundSize: "0% 1px",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left bottom",
      transition: "background-size 0.25s ease-in",
      "&:hover": {
        textDecoration: "none",
        backgroundSize: "100% 1px",
      },
    }),
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const link: Components<Theme> = {
  MuiLink,
};
