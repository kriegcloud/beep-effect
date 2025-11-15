import { Iconify, iconifyClasses } from "@beep/ui/atoms";
import type { LinkProps } from "@mui/material/Link";
import Link from "@mui/material/Link";
import { RouterLink } from "../RouterLink";

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
          [`& .${iconifyClasses.root}`]: {
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
            [`& .${iconifyClasses.root}`]: {
              opacity: 0.48,
            },
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Iconify width={18} icon="eva:arrow-ios-back-fill" />
      {label}
    </Link>
  );
}
