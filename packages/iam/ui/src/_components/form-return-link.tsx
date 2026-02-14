import { RouterLink } from "@beep/ui/routing/index";
import type { LinkProps } from "@mui/material/Link";
import Link from "@mui/material/Link";
import { CaretLeftIcon } from "@phosphor-icons/react";

type FormReturnLinkProps = LinkProps & {
  readonly href: string;
  readonly icon?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
};

export function FormReturnLink({ sx, href, label, icon, children, ...other }: FormReturnLinkProps) {
  return (
    <Link
      component={RouterLink}
      href={href}
      color="inherit"
      variant="subtitle2"
      sx={[
        {
          mt: 3,
          gap: 0.5,
          mx: "auto",
          alignItems: "center",
          display: "inline-flex",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {icon || <CaretLeftIcon size={16} weight="fill" />}
      {label || "Return to sign in"}
      {children}
    </Link>
  );
}
