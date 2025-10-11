import { navSectionClasses } from "@beep/ui/routing";
import { mergeClasses } from "@beep/ui-core/utils";
import { styled } from "@mui/material/styles";

export const Nav = styled("nav")``;

type NavLiProps = React.ComponentProps<"li"> & {
  disabled?: boolean;
};

export const NavLi = styled(
  (props: NavLiProps) => <li {...props} className={mergeClasses([navSectionClasses.li, props.className])} />,
  { shouldForwardProp: (prop: string) => !["disabled", "sx"].includes(prop) }
)(() => ({
  display: "inline-block",
  variants: [{ props: { disabled: true }, style: { cursor: "not-allowed" } }],
}));

type NavUlProps = React.ComponentProps<"ul">;

export const NavUl = styled((props: NavUlProps) => (
  <ul {...props} className={mergeClasses([navSectionClasses.ul, props.className])} />
))(() => ({ display: "flex", flexDirection: "column" }));
