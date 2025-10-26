import { Iconify } from "@beep/ui/atoms";
import type { AccountDrawerProps } from "./components/account-drawer";

export const _account: AccountDrawerProps["data"] = [
  {
    label: "Home",
    href: "/",
    icon: <Iconify icon="solar:home-angle-bold-duotone" />,
  },
  {
    label: "Profile",
    href: "#",
    icon: <Iconify icon="custom:profile-duotone" />,
  },
  {
    label: "Projects",
    href: "#",
    icon: <Iconify icon="solar:notes-bold-duotone" />,
    info: "3",
  },
  {
    label: "Subscription",
    href: "#",
    icon: <Iconify icon="custom:invoice-duotone" />,
  },
  {
    label: "Security",
    href: "#",
    icon: <Iconify icon="solar:shield-keyhole-bold-duotone" />,
  },
  {
    label: "Account settings",
    href: "#",
    icon: <Iconify icon="solar:settings-bold-duotone" />,
  },
];
