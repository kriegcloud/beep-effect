import { mergeClasses } from "@beep/ui-core/utils";

import { styled } from "@mui/material/styles";

import { navBasicClasses } from "../styles";

export const Nav = styled("nav")``;

type NavLiProps = React.ComponentProps<"li"> & { disabled?: boolean };

export const NavLi = styled(
  (props: NavLiProps) => <li {...props} className={mergeClasses([navBasicClasses.li, props.className])} />,
  { shouldForwardProp: (prop: string) => !["disabled", "sx"].includes(prop) }
)(() => ({
  display: "inline-block",
  variants: [
    {
      props: { disabled: true },
      style: { cursor: "not-allowed" },
    },
  ],
}));

type NavUlProps = React.ComponentProps<"ul">;

export const NavUl = styled((props: NavUlProps) => (
  <ul {...props} className={mergeClasses([navBasicClasses.ul, props.className])} />
))(() => ({ display: "flex", flexDirection: "column" }));
