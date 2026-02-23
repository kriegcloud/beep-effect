import { HouseIcon } from "@phosphor-icons/react";
import type { NavMainProps } from "./main/nav/types";

export const navData: NavMainProps["data"] = [
  {
    title: "Home",
    path: "/",
    icon: <HouseIcon size={22} weight="duotone" />,
  },
];
