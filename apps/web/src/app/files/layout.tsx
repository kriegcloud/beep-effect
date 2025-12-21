import { FilesLayout } from "@beep/shared-ui/files/FilesLayout";
import type React from "react";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <FilesLayout>{children}</FilesLayout>;
};

export default Layout;
