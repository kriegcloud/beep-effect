import type React from "react";
import { LayoutClient } from "@/app/dashboard/_layout-client";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <LayoutClient>{children}</LayoutClient>;
};

export default Layout;
