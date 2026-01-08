import type { UnsafeTypes } from "@beep/types";
import { StrUtils } from "@beep/utils";
import { orderBy } from "@beep/utils/data/array.utils/order-by";
import * as A from "effect/Array";
import * as F from "effect/Function";

// ----------------------------------------------------------------------

type CreateNavItemProps = {
  readonly name: string;
  readonly packageType?: string | undefined;
  readonly iconPrefix: "ic" | "ic-extra";
  readonly category: "foundation" | "mui" | "extra";
};

export type NavItemData = {
  readonly name: string;
  readonly icon: UnsafeTypes.UnsafeAny;
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

const foundationNav = F.pipe(
  ["Colors", "Typography", "Shadows", "Grid", "Icons"],
  A.map((name) =>
    createNavItem({
      name,
      category: "foundation",
      iconPrefix: "ic",
      packageType: "Foundation",
    })
  )
);

// ----------------------------------------------------------------------

const MUI_X_COMPONENTS = ["Data grid", "Date pickers", "Tree view"];

const muiNav = F.pipe(
  [
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
  ],
  A.map((name) =>
    createNavItem({
      name,
      category: "mui",
      iconPrefix: "ic",
      packageType: F.pipe(MUI_X_COMPONENTS, A.contains(name)) ? "MUI X" : "MUI",
    })
  )
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

const extraNav = F.pipe(
  [...THIRD_PARTY_COMPONENTS, "Image", "Label", "Layout", "Mega menu", "Utilities", "Navigation bar"],
  A.map((name) =>
    createNavItem({
      name,
      category: "extra",
      iconPrefix: "ic-extra",
      packageType: F.pipe(THIRD_PARTY_COMPONENTS, A.contains(name)) ? "3rd Party" : "Custom",
    })
  )
);

export const allComponents = [
  { title: "Foundation", items: foundationNav },
  { title: "Mui", items: orderBy(muiNav, ["name"], ["asc"]) },
  { title: "Extra", items: orderBy(extraNav, ["name"], ["asc"]) },
] as const;
