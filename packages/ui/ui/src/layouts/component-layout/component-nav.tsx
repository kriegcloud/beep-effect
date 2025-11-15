import { usePathname } from "@beep/ui/hooks";
import { isEqualPath, mergeClasses } from "@beep/ui-core/utils";
import ListSubheader from "@mui/material/ListSubheader";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled, useTheme } from "@mui/material/styles";
import { componentLayoutClasses } from "./classes";
import { NavItem } from "./component-nav-item";
import { NavSearch } from "./component-search";
import type { NavItemData } from "./nav-config-components";

// ----------------------------------------------------------------------

type NavRootProps = React.ComponentProps<typeof NavRoot>;

const NavRoot = styled("div")(({ theme }) => ({
  maxHeight: 800,
  display: "none",
  position: "sticky",
  alignSelf: "start",
  flexDirection: "column",
  padding: theme.spacing(0, "var(--nav-gutters)"),
  top: "calc(var(--layout-header-desktop-height) + 24px)",
}));

const NavSection = styled("nav")({
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
});

const NavUl = styled("ul")({
  display: "flex",
  flexDirection: "column",
});

const NavLi = styled("li")({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
});

// ----------------------------------------------------------------------

export type PrimaryNavProps = NavRootProps & {
  readonly navData?:
    | ReadonlyArray<{
        readonly title: string;
        readonly items: ReadonlyArray<NavItemData>;
      }>
    | undefined;
};

export function PrimaryNav({ sx, navData, className, ...other }: PrimaryNavProps) {
  const theme = useTheme();
  return (
    <NavRoot className={mergeClasses([componentLayoutClasses.primaryNav, className])} sx={sx ?? {}} {...other}>
      <NavSearch navData={navData} sx={{ mb: 4 }} />

      <NavSection>
        <NavUl
          sx={{
            ...theme.mixins.hideScrollY,
            "--arrow-size": "7px",
            "--arrow-offset-left": "-14px",
            gap: "var(--primary-nav-list-gap)",
          }}
        >
          {navData?.map((section) => (
            <PrimaryNavList key={section.title} subheader={section.title} items={section.items} />
          ))}
        </NavUl>
      </NavSection>
    </NavRoot>
  );
}

// ----------------------------------------------------------------------

type NavListProps = {
  readonly subheader: string;
  readonly items: ReadonlyArray<NavItemData>;
};

function PrimaryNavList({ subheader, items }: NavListProps) {
  const pathname = usePathname();

  const borderStyles: SxProps<Theme> = {
    top: 0,
    left: 3,
    bottom: 0,
    my: "auto",
    width: "1px",
    content: '""',
    bgcolor: "divider",
    position: "absolute",
    height: "calc(100% - 12px)",
  };

  return (
    <NavLi>
      <ListSubheader
        component="h6"
        sx={{
          px: 0,
          pb: 0.5,
          mt: 0,
          mx: 0,
          mb: 0.5,
          width: 1,
          color: "text.primary",
          typography: "overline",
          bgcolor: "background.default",
        }}
      >
        {subheader}
      </ListSubheader>

      <NavUl
        sx={{
          pl: "21px",
          position: "relative",
          gap: "var(--primary-nav-item-gap)",
          "&::before": borderStyles,
        }}
      >
        {items.map((item) => (
          <NavLi key={item.name}>
            <NavItem
              href={item.href}
              isActive={isEqualPath(item.href, pathname)}
              autoFocus={isEqualPath(item.href, pathname)}
            >
              {item.name} {item.packageType === "MUI X" && <>(MUI X)</>}
            </NavItem>
          </NavLi>
        ))}
      </NavUl>
    </NavLi>
  );
}

// ----------------------------------------------------------------------

type SecondaryNavProps = NavRootProps & {
  activeItem: number | null;
  onClickItem: (index: number) => void;
  navData?: {
    name: string;
    description?: React.ReactNode;
    component: React.ReactNode;
  }[];
};

export function SecondaryNav({ sx, navData, className, onClickItem, activeItem, ...other }: SecondaryNavProps) {
  return (
    <NavRoot className={mergeClasses([componentLayoutClasses.secondaryNav, className])} sx={sx ?? {}} {...other}>
      <NavSection>
        <NavUl sx={{ gap: "var(--secondary-nav-item-gap)" }}>
          <NavLi sx={{ mb: 1, typography: "overline" }}>On this page</NavLi>

          {navData?.map((item, index) => (
            <NavLi key={item.name}>
              <NavItem isActive={activeItem === index} onClick={() => onClickItem(index)}>
                {index + 1} - {item.name}
              </NavItem>
            </NavLi>
          ))}
        </NavUl>
      </NavSection>
    </NavRoot>
  );
}
