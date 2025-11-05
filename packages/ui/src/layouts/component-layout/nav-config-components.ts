import { StrUtils } from "@beep/utils";
import { orderBy } from "@beep/utils/data/array.utils/order-by";

// ----------------------------------------------------------------------

type CreateNavItemProps = {
  readonly name: string;
  readonly packageType?: string | undefined;
  readonly iconPrefix: "ic" | "ic-extra";
  readonly category: "foundation" | "mui" | "extra";
};

export type NavItemData = {
  readonly name: string;
  readonly icon: any;
  readonly href: string;
  readonly packageType?: string | undefined;
};

const createNavItem = ({ category, name, iconPrefix, packageType }: CreateNavItemProps) => ({
  name,
  href: `/components/${category}/${StrUtils.kebabCase(name)}` as const,
  icon: `/assets/icons/components/${iconPrefix}-${StrUtils.kebabCase(name)}.svg` as const,
  packageType,
});

// ----------------------------------------------------------------------

const foundationNav = ["Colors", "Typography", "Shadows", "Grid", "Icons"].map((name) =>
  createNavItem({
    name,
    category: "foundation",
    iconPrefix: "ic",
    packageType: "Foundation",
  })
);

// ----------------------------------------------------------------------

const MUI_X_COMPONENTS = ["Data grid", "Date pickers", "Tree view"];

const muiNav = [
  ...MUI_X_COMPONENTS,
  "Chip",
  "List",
  "Menu",
  "Tabs",
  "Alert",
  "Badge",
  "Table",
  "Avatar",
  "Dialog",
  "Rating",
  "Slider",
  "Switch",
  "Drawer",
  "Buttons",
  "Popover",
  "Stepper",
  "Tooltip",
  "Checkbox",
  "Progress",
  "Timeline",
  "Accordion",
  "Text field",
  "Pagination",
  "Breadcrumbs",
  "Autocomplete",
  "Radio button",
  "Transfer list",
].map((name) =>
  createNavItem({
    name,
    category: "mui",
    iconPrefix: "ic",
    packageType: MUI_X_COMPONENTS.includes(name) ? "MUI X" : "MUI",
  })
);

// ----------------------------------------------------------------------

const THIRD_PARTY_COMPONENTS = [
  "Map",
  "Dnd",
  "Chart",
  "Editor",
  "Upload",
  "Animate",
  "Carousel",
  "Lightbox",
  "Snackbar",
  "Markdown",
  "Scrollbar",
  "Form wizard",
  "Multi-language",
  "Form validation",
  "Scroll progress",
  "Organization chart",
];

const extraNav = [
  ...THIRD_PARTY_COMPONENTS,
  "Image",
  "Label",
  "Layout",
  "Mega menu",
  "Utilities",
  "Navigation bar",
].map((name) =>
  createNavItem({
    name,
    category: "extra",
    iconPrefix: "ic-extra",
    packageType: THIRD_PARTY_COMPONENTS.includes(name) ? "3rd Party" : "Custom",
  })
);

export const allComponents = [
  { title: "Foundation", items: foundationNav },
  { title: "Mui", items: orderBy(muiNav, ["name"], ["asc"]) },
  { title: "Extra", items: orderBy(extraNav, ["name"], ["asc"]) },
] as const;
