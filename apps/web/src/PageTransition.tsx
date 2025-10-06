"use client";

import { varFade } from "@beep/ui/animate/variants/fade";
import Box from "@mui/material/Box";
import { AnimatePresence, m } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const pageVariants = varFade("inUp", { distance: 48 });

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode={"wait"} initial={false}>
      <Box
        key={pathname}
        component={m.div}
        variants={pageVariants}
        initial={"initial"}
        animate={"animate"}
        exit={"exit"}
        sx={{ width: 1, minHeight: "100%", display: "flex", flexDirection: "column", flexGrow: 1 }}
      >
        {children}
      </Box>
    </AnimatePresence>
  );
}
