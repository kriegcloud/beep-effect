import { Iconify } from "@beep/ui/atoms";
import type { NavMainProps } from "./main/nav/types";

export const navData: NavMainProps["data"] = [
  {
    title: "Home",
    path: "/",
    icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" />,
  },
];
