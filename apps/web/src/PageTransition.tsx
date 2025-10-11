"use client";

import Box from "@mui/material/Box";
import { AnimatePresence, m, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

const pageVariants: Variants = {
  initial: { opacity: 0, transform: "none" },
  animate: {
    opacity: 1,
    transform: "none",
    transition: { duration: 0.24, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transform: "none",
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    setCanAnimate(true);
  }, []);

  return (
    <AnimatePresence mode={"wait"} initial={false}>
      <Box
        key={pathname}
        component={m.div}
        variants={pageVariants}
        initial={canAnimate ? "initial" : false}
        animate={"animate"}
        exit={"exit"}
        sx={{ width: 1, minHeight: "100%", display: "flex", flexDirection: "column", flexGrow: 1 }}
      >
        {children}
      </Box>
    </AnimatePresence>
  );
}
