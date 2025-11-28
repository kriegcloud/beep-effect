"use client";

import type * as React from "react";

export const MainLayout = ({
  children,
  // footer = true,
}: {
  children: React.ReactNode;
  footer?: boolean;
}) => {
  return (
    <div className="flex h-full min-h-dvh flex-col">
      {/* <Header /> */}
      <main className="flex-1">{children}</main>
      {/* {footer && <Footer />} */}
    </div>
  );
};
