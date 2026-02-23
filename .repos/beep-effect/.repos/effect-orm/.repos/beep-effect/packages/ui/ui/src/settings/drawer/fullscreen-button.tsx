"use client";

import { Iconify } from "@beep/ui/atoms";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useCallback, useState } from "react";

export function FullScreenButton() {
  const [fullscreen, setFullscreen] = useState(false);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else if (document.exitFullscreen) {
      void document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  return (
    <Tooltip title={fullscreen ? "Exit" : "Fullscreen"}>
      <IconButton onClick={handleToggleFullscreen} color={fullscreen ? "primary" : "default"}>
        <Iconify icon={fullscreen ? "solar:quit-full-screen-square-outline" : "solar:full-screen-square-outline"} />
      </IconButton>
    </Tooltip>
  );
}
