import type { LinkProps } from "@mui/material/Link";
import Link from "@mui/material/Link";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { RouterLink } from "../RouterLink";

const backLinkIconClass = "back-link__icon";

export type BackLinkProps = LinkProps & {
  readonly label?: string | undefined;
};

export function BackLink({ sx, label, ...other }: BackLinkProps) {
  return (
    <Link
      component={RouterLink}
      color="inherit"
      underline="none"
      sx={[
        (theme) => ({
          verticalAlign: "middle",
          [`& .${backLinkIconClass}`]: {
            display: "inline-flex",
            verticalAlign: "inherit",
            transform: "translateY(-2px)",
            ml: {
              xs: "-14px",
              md: "-18px",
            },
            transition: theme.transitions.create(["opacity"], {
              duration: theme.transitions.duration.shorter,
              easing: theme.transitions.easing.sharp,
            }),
          },
          "&:hover": {
            [`& .${backLinkIconClass}`]: {
              opacity: 0.48,
            },
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <span className={backLinkIconClass}>
        <CaretLeftIcon size={18} weight="fill" />
      </span>
      {label}
    </Link>
  );
}
