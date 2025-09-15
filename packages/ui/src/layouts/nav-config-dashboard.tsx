import { Iconify, Label, SvgColor } from "@beep/ui/atoms";
import type { NavSectionProps } from "@beep/ui/routing";
import { kebabCase } from "es-toolkit";
export const _id = Array.from({ length: 40 }, (_, index) => `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b${index + 1}`);
export const _postTitles = [
  `The Future of Renewable Energy: Innovations and Challenges Ahead`,
  `Exploring the Impact of Artificial Intelligence on Modern Healthcare`,
  `Climate Change and Its Effects on Global Food Security`,
  `The Rise of Remote Work: Benefits, Challenges, and Future Trends`,
  `Understanding Blockchain Technology: Beyond Cryptocurrency`,
  `Mental Health in the Digital Age: Navigating Social Media and Well-being`,
  `Sustainable Fashion: How the Industry is Going Green`,
  `Space Exploration: New Frontiers and the Quest for Extraterrestrial Life`,
  `The Evolution of E-Commerce: Trends Shaping the Online Retail Landscape`,
  `Cybersecurity in the 21st Century: Protecting Data in a Digital World`,
  `The Role of Big Data in Transforming Business Strategies`,
  `Genetic Engineering: Ethical Considerations and Future Prospects`,
  `Urban Farming: A Solution to Food Deserts and Urban Sustainability`,
  `The Psychology of Consumer Behavior: What Drives Our Purchasing Decisions?`,
  `Renewable Energy vs. Fossil Fuels: Which is the Future?`,
  `Artificial Intelligence in Education: Enhancing Learning Experiences`,
  `The Impact of Climate Change on Global Migration Patterns`,
  `5G Technology: Revolutionizing Connectivity and Communication`,
  `The Gig Economy: Opportunities, Risks, and the Future of Work`,
  `Smart Cities: Integrating Technology for Sustainable Urban Living`,
  `The Influence of Pop Culture on Modern Society`,
  `Innovations in Medicine: From Telehealth to Personalized Treatment`,
  `The Environmental Cost of Fast Fashion: What Can Consumers Do?`,
  `The Intersection of Art and Technology: Digital Art in the 21st Century`,
] as const;
const MOCK_ID = _id[1]!;
const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: "/auth",
  AUTH_DEMO: "/auth-demo",
  DASHBOARD: "/dashboard",
};

export const paths = {
  comingSoon: "/coming-soon",
  maintenance: "/maintenance",
  pricing: "/pricing",
  payment: "/payment",
  about: "/about-us",
  contact: "/contact-us",
  faqs: "/faqs",
  page403: "/error/403",
  page404: "/error/404",
  page500: "/error/500",
  components: "/components",
  docs: "https://docs.minimals.cc/",
  changelog: "https://docs.minimals.cc/changelog/",
  zoneStore: "https://mui.com/store/items/zone-landing-page/",
  minimalStore: "https://mui.com/store/items/minimal-dashboard/",
  freeUI: "https://mui.com/store/items/minimal-dashboard-free/",
  figmaUrl: "https://www.figma.com/design/WadcoP3CSejUDj7YZc87xj/%5BPreview%5D-Minimal-Web.v7.3.0",
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id: string) => `/product/${id}`,
    demo: { details: `/product/${MOCK_ID}` },
  },
  post: {
    root: `/post`,
    details: (title: string) => `/post/${kebabCase(title)}`,
    demo: { details: `/post/${kebabCase(MOCK_TITLE)}` },
  },
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: { signIn: `${ROOTS.AUTH}/auth0/sign-in` },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  authDemo: {
    split: {
      signIn: `${ROOTS.AUTH_DEMO}/split/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/split/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/split/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/split/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/split/verify`,
    },
    centered: {
      signIn: `${ROOTS.AUTH_DEMO}/centered/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/centered/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/centered/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/centered/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/centered/verify`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    mail: `${ROOTS.DASHBOARD}/mail`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    fileManager: `${ROOTS.DASHBOARD}/file-manager`,
    permission: `${ROOTS.DASHBOARD}/permission`,
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
      course: `${ROOTS.DASHBOARD}/course`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      cards: `${ROOTS.DASHBOARD}/user/cards`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      demo: { edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit` },
    },
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoice`,
      new: `${ROOTS.DASHBOARD}/invoice/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/invoice/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}/edit`,
      },
    },
    post: {
      root: `${ROOTS.DASHBOARD}/post`,
      new: `${ROOTS.DASHBOARD}/post/new`,
      details: (title: string) => `${ROOTS.DASHBOARD}/post/${kebabCase(title)}`,
      edit: (title: string) => `${ROOTS.DASHBOARD}/post/${kebabCase(title)}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/post/${kebabCase(MOCK_TITLE)}`,
        edit: `${ROOTS.DASHBOARD}/post/${kebabCase(MOCK_TITLE)}/edit`,
      },
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      details: (id: string) => `${ROOTS.DASHBOARD}/order/${id}`,
      demo: { details: `${ROOTS.DASHBOARD}/order/${MOCK_ID}` },
    },
    job: {
      root: `${ROOTS.DASHBOARD}/job`,
      new: `${ROOTS.DASHBOARD}/job/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/job/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    tour: {
      root: `${ROOTS.DASHBOARD}/tour`,
      new: `${ROOTS.DASHBOARD}/tour/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/tour/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}/edit`,
      },
    },
  },
};

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
   * Overview
   */
  {
    subheader: "Overview",
    items: [
      { title: "App", path: paths.dashboard.root, icon: ICONS.dashboard },
      { title: "Ecommerce", path: paths.dashboard.general.ecommerce, icon: ICONS.ecommerce },
      { title: "Analytics", path: paths.dashboard.general.analytics, icon: ICONS.analytics },
      { title: "Banking", path: paths.dashboard.general.banking, icon: ICONS.banking },
      { title: "Booking", path: paths.dashboard.general.booking, icon: ICONS.booking },
      { title: "File", path: paths.dashboard.general.file, icon: ICONS.file },
      { title: "Course", path: paths.dashboard.general.course, icon: ICONS.course },
    ],
  },
  /**
   * Management
   */
  {
    subheader: "Management",
    items: [
      {
        title: "User",
        path: paths.dashboard.user.root,
        icon: ICONS.user,
        children: [
          { title: "Profile", path: paths.dashboard.user.root },
          { title: "Cards", path: paths.dashboard.user.cards },
          { title: "List", path: paths.dashboard.user.list },
          { title: "Create", path: paths.dashboard.user.new },
          { title: "Edit", path: paths.dashboard.user.demo.edit },
          { title: "Account", path: paths.dashboard.user.account, deepMatch: true },
        ],
      },
      {
        title: "Product",
        path: paths.dashboard.product.root,
        icon: ICONS.product,
        children: [
          { title: "List", path: paths.dashboard.product.root },
          { title: "Details", path: paths.dashboard.product.demo.details },
          { title: "Create", path: paths.dashboard.product.new },
          { title: "Edit", path: paths.dashboard.product.demo.edit },
        ],
      },
      {
        title: "Order",
        path: paths.dashboard.order.root,
        icon: ICONS.order,
        children: [
          { title: "List", path: paths.dashboard.order.root },
          { title: "Details", path: paths.dashboard.order.demo.details },
        ],
      },
      {
        title: "Invoice",
        path: paths.dashboard.invoice.root,
        icon: ICONS.invoice,
        children: [
          { title: "List", path: paths.dashboard.invoice.root },
          { title: "Details", path: paths.dashboard.invoice.demo.details },
          { title: "Create", path: paths.dashboard.invoice.new },
          { title: "Edit", path: paths.dashboard.invoice.demo.edit },
        ],
      },
      {
        title: "Blog",
        path: paths.dashboard.post.root,
        icon: ICONS.blog,
        children: [
          { title: "List", path: paths.dashboard.post.root },
          { title: "Details", path: paths.dashboard.post.demo.details },
          { title: "Create", path: paths.dashboard.post.new },
          { title: "Edit", path: paths.dashboard.post.demo.edit },
        ],
      },
      {
        title: "Job",
        path: paths.dashboard.job.root,
        icon: ICONS.job,
        children: [
          { title: "List", path: paths.dashboard.job.root },
          { title: "Details", path: paths.dashboard.job.demo.details },
          { title: "Create", path: paths.dashboard.job.new },
          { title: "Edit", path: paths.dashboard.job.demo.edit },
        ],
      },
      {
        title: "Tour",
        path: paths.dashboard.tour.root,
        icon: ICONS.tour,
        children: [
          { title: "List", path: paths.dashboard.tour.root },
          { title: "Details", path: paths.dashboard.tour.demo.details },
          { title: "Create", path: paths.dashboard.tour.new },
          { title: "Edit", path: paths.dashboard.tour.demo.edit },
        ],
      },
      { title: "File manager", path: paths.dashboard.fileManager, icon: ICONS.folder },
      {
        title: "Mail",
        path: paths.dashboard.mail,
        icon: ICONS.mail,
        info: (
          <Label color="error" variant="inverted">
            +32
          </Label>
        ),
      },
      { title: "Chat", path: paths.dashboard.chat, icon: ICONS.chat },
      { title: "Calendar", path: paths.dashboard.calendar, icon: ICONS.calendar },
      { title: "Kanban", path: paths.dashboard.kanban, icon: ICONS.kanban },
    ],
  },
  /**
   * Item state
   */
  {
    subheader: "Misc",
    items: [
      {
        /**
         * Permissions can be set for each item by using the `allowedRoles` property.
         * - If `allowedRoles` is not set (default), all roles can see the item.
         * - If `allowedRoles` is an empty array `[]`, no one can see the item.
         * - If `allowedRoles` contains specific roles, only those roles can see the item.
         *
         * Examples:
         * - `allowedRoles: ['user']` - only users with the 'user' role can see this item.
         * - `allowedRoles: ['admin']` - only users with the 'admin' role can see this item.
         * - `allowedRoles: ['admin', 'manager']` - only users with the 'admin' or 'manager' roles can see this item.
         *
         * Combine with the `checkPermissions` prop to build conditional expressions.
         * Example usage can be found in: src/sections/_examples/extra/navigation-bar-view/nav-vertical.{jsx | tsx}
         */
        title: "Permission",
        path: paths.dashboard.permission,
        icon: ICONS.lock,
        allowedRoles: ["admin", "manager"],
        caption: "Only admin can see this item.",
      },
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
      { title: "Blank", path: paths.dashboard.blank, icon: ICONS.blank },
    ],
  },
];
