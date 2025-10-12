"use client";

import { Iconify } from "@beep/ui/atoms";
import { useThemeMode } from "@beep/ui/hooks";
import { Button } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

interface ThemeTogglerProps {
  type?: "default" | "slim";
}

const ThemeToggler = ({ type = "default" }: ThemeTogglerProps) => {
  const { isDark, setThemeMode } = useThemeMode();
  const lastClickTimeRef = useRef(0);
  const router = useRouter();
  const pathname = usePathname();
  // material-symbols:light-mode-outline-rounded

  const handleClick = useCallback(() => {
    router.replace(pathname);

    const now = Date.now();
    if (now - lastClickTimeRef.current < 300) return;

    lastClickTimeRef.current = now;
    setThemeMode();
  }, [setThemeMode]);

  return (
    <Button
      color="neutral"
      variant={type === "default" ? "soft" : "text"}
      shape="circle"
      onClick={handleClick}
      size={type === "slim" ? "small" : "medium"}
    >
      <Iconify
        icon={
          isDark
            ? "material-symbols-light:light-off-outline-rounded"
            : "material-symbols-light:lightbulb-outline-rounded"
        }
        sx={{ fontSize: type === "slim" ? 18 : 22 }}
      />
    </Button>
  );
};

export default ThemeToggler;
