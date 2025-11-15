import { Iconify, Label, SvgColor } from "@beep/ui/atoms";
import type { NavSectionProps } from "@beep/ui/routing";

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon("ic-job"),
  blog: icon("ic-blog"),
  chat: icon("ic-chat"),
  mail: icon("ic-mail"),
  user: icon("ic-user"),
  file: icon("ic-file"),
  lock: icon("ic-lock"),
  tour: icon("ic-tour"),
  order: icon("ic-order"),
  label: icon("ic-label"),
  blank: icon("ic-blank"),
  kanban: icon("ic-kanban"),
  folder: icon("ic-folder"),
  course: icon("ic-course"),
  params: icon("ic-params"),
  banking: icon("ic-banking"),
  booking: icon("ic-booking"),
  invoice: icon("ic-invoice"),
  product: icon("ic-product"),
  calendar: icon("ic-calendar"),
  disabled: icon("ic-disabled"),
  external: icon("ic-external"),
  subpaths: icon("ic-subpaths"),
  menuItem: icon("ic-menu-item"),
  ecommerce: icon("ic-ecommerce"),
  analytics: icon("ic-analytics"),
  dashboard: icon("ic-dashboard"),
};

/**
 * Input nav data is an array of navigation section items used to define the structure and content of a navigation bar.
 * Each section contains a subheader and an array of items, which can include nested children items.
 *
 * Each item can have the following properties:
 * - `title`: The title of the navigation item.
 * - `path`: The URL path the item links to.
 * - `icon`: An optional icon component to display alongside the title.
 * - `info`: Optional additional information to display, such as a label.
 * - `allowedRoles`: An optional array of roles that are allowed to see the item.
 * - `caption`: An optional caption to display below the title.
 * - `children`: An optional array of nested navigation items.
 * - `disabled`: An optional boolean to disable the item.
 * - `deepMatch`: An optional boolean to indicate if the item should match subpaths.
 */
export const navData: NavSectionProps["data"] = [
  /**
   * Item state
   */
  {
    subheader: "Misc",
    items: [
      {
        title: "Level",
        path: "#/dashboard/menu-level",
        icon: ICONS.menuItem,
        children: [
          {
            title: "Level 1a",
            path: "#/dashboard/menu-level/1a",
            children: [
              { title: "Level 2a", path: "#/dashboard/menu-level/1a/2a" },
              {
                title: "Level 2b",
                path: "#/dashboard/menu-level/1a/2b",
                children: [
                  {
                    title: "Level 3a",
                    path: "#/dashboard/menu-level/1a/2b/3a",
                  },
                  {
                    title: "Level 3b",
                    path: "#/dashboard/menu-level/1a/2b/3b",
                  },
                ],
              },
            ],
          },
          { title: "Level 1b", path: "#/dashboard/menu-level/1b" },
        ],
      },
      {
        title: "Disabled",
        path: "#disabled",
        icon: ICONS.disabled,
        disabled: true,
      },
      {
        title: "Label",
        path: "#label",
        icon: ICONS.label,
        info: (
          <Label color="info" variant="inverted" startIcon={<Iconify icon="solar:bell-bing-bold-duotone" />}>
            NEW
          </Label>
        ),
      },
      {
        title: "Caption",
        path: "#caption",
        icon: ICONS.menuItem,
        caption:
          "Quisque malesuada placerat nisl. In hac habitasse platea dictumst. Cras id dui. Pellentesque commodo eros a enim. Morbi mollis tellus ac sapien.",
      },
      {
        title: "Params",
        path: "/dashboard/params?id=e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1",
        icon: ICONS.params,
      },
      {
        title: "Subpaths",
        path: "/dashboard/subpaths",
        icon: ICONS.subpaths,
        deepMatch: true,
      },
      {
        title: "External link",
        path: "https://www.google.com/",
        icon: ICONS.external,
        info: <Iconify width={18} icon="eva:external-link-fill" />,
      },
    ],
  },
];
