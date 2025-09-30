"use client";

import { varFade } from "@beep/ui/animate/variants/fade";
import { SplashScreen } from "@beep/ui/progress";
import { m } from "framer-motion";

const splashVariants = varFade("in");

export default function Loading() {
  return (
    <m.div variants={splashVariants} initial="initial" animate="animate" exit="exit">
      <SplashScreen portal={false} />
    </m.div>
  );
}
