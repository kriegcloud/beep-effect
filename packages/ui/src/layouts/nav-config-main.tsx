import { Iconify } from "@beep/ui/atoms";
import { paths } from "@beep/ui/layouts/nav-config-dashboard";
import type { NavMainProps } from "./main/nav/types";

export const navData: NavMainProps["data"] = [
  { title: "Home", path: "/", icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" /> },
  {
    title: "Components",
    path: paths.components,
    icon: <Iconify width={22} icon="solar:atom-bold-duotone" />,
  },
  {
    title: "Pages",
    path: "/pages",
    icon: <Iconify width={22} icon="solar:file-bold-duotone" />,
    children: [
      {
        subheader: "Other",
        items: [
          { title: "About us", path: paths.about },
          { title: "Contact us", path: paths.contact },
          { title: "FAQs", path: paths.faqs },
          { title: "Pricing", path: paths.pricing },
          { title: "Payment", path: paths.payment },
          { title: "Maintenance", path: paths.maintenance },
          { title: "Coming soon", path: paths.comingSoon },
        ],
      },
      {
        subheader: "Concepts",
        items: [
          { title: "Shop", path: paths.product.root },
          { title: "Product", path: paths.product.demo.details },
          { title: "Checkout", path: paths.product.checkout },
          { title: "Posts", path: paths.post.root },
          { title: "Post", path: paths.post.demo.details },
        ],
      },
      {
        subheader: "Auth Demo",
        items: [
          { title: "Sign in", path: paths.authDemo.split.signIn },
          { title: "Sign up", path: paths.authDemo.split.signUp },
          { title: "Reset password", path: paths.authDemo.split.resetPassword },
          { title: "Update password", path: paths.authDemo.split.updatePassword },
          { title: "Verify", path: paths.authDemo.split.verify },
          { title: "Sign in (centered)", path: paths.authDemo.centered.signIn },
          { title: "Sign up (centered)", path: paths.authDemo.centered.signUp },
          { title: "Reset password (centered)", path: paths.authDemo.centered.resetPassword },
          { title: "Update password (centered)", path: paths.authDemo.centered.updatePassword },
          { title: "Verify (centered)", path: paths.authDemo.centered.verify },
        ],
      },
      {
        subheader: "Error",
        items: [
          { title: "Page 403", path: paths.page403 },
          { title: "Page 404", path: paths.page404 },
          { title: "Page 500", path: paths.page500 },
        ],
      },
      { subheader: "Dashboard", items: [{ title: "Dashboard", path: "/" }] },
    ],
  },
  {
    title: "Docs",
    icon: <Iconify width={22} icon="solar:notebook-bold-duotone" />,
    path: paths.docs,
  },
];
