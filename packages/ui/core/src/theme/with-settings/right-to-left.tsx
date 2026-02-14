import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import type { Direction } from "@mui/material/styles";
import rtlPlugin from "@mui/stylis-plugin-rtl";
import { useEffect } from "react";

type RtlProps = {
  direction: Direction;
  children: React.ReactNode;
  nonce?: string | undefined;
};

const cacheRtl = (nonce?: string) =>
  createCache({
    key: "rtl",
    ...(nonce != null && { nonce }),
    stylisPlugins: [rtlPlugin],
  });

export function Rtl({ children, direction, nonce }: RtlProps) {
  useEffect(() => {
    document.dir = direction;
  }, [direction]);

  if (direction === "rtl") {
    return <CacheProvider value={cacheRtl(nonce)}>{children}</CacheProvider>;
  }

  return <>{children}</>;
}
