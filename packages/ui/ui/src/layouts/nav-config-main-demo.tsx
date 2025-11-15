import type { NavBasicProps } from "@beep/ui/routing/nav-basic";

export const demoNavData: NavBasicProps["data"] = [
  { title: "Home", path: "/" },
  { title: "Components", path: "/components" },
  {
    title: "Pages",
    path: "/pages",
    children: [
      { title: "Page 1", path: "/pages/1" },
      { title: "Page 2", path: "/pages/2" },
      { title: "Page 3", path: "/pages/3" },
    ],
  },
  {
    title: "Items",
    path: "/items",
    children: [
      { title: "Item 1", path: "/items/1" },
      { title: "Item 2", path: "/items/2" },
      { title: "Item 3", path: "/items/3" },
    ],
  },
  { title: "Docs", path: "/items" },
];
