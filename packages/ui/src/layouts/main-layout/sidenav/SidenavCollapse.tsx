"use client";

import { useSettingsContext } from "@beep/ui/settings-v2/SettingsProvider";
import { useGSAP } from "@gsap/react";
import { Box, ButtonBase, Tooltip } from "@mui/material";
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { useRef, useState } from "react";

gsap.registerPlugin(MorphSVGPlugin);

const SidenavCollapse = () => {
  const [isHovered, setIsHovered] = useState(false);
  const pathRef = useRef(null);
  const svgRef = useRef(null);
  const {
    config: { sidenavCollapsed, textDirection },
    toggleNavbarCollapse,
  } = useSettingsContext();

  const paths = {
    vertical: "M8 4v16",
    chevronRight: "M8 6l6 6-6 6",
    chevronLeft: "M14 6l-6 6 6 6",
  };

  useGSAP(() => {
    if (!pathRef.current) return;

    const targetPath = isHovered
      ? sidenavCollapsed
        ? textDirection === "rtl"
          ? paths.chevronLeft
          : paths.chevronRight
        : textDirection === "rtl"
          ? paths.chevronRight
          : paths.chevronLeft
      : paths.vertical;

    gsap.to(pathRef.current, {
      duration: 0.3,
      morphSVG: targetPath,
      ease: "power2.out",
    });
  }, [isHovered, sidenavCollapsed, textDirection]);

  return (
    <ButtonBase
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={toggleNavbarCollapse}
      disableRipple
      sx={{
        width: 40,
        flexShrink: 0,
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        right: -30,
        height: 80,
        borderRadius: 0,
        textAlign: "center",
        p: "0px !important",
      }}
    >
      <Tooltip
        open={isHovered}
        title={sidenavCollapsed ? "Expand" : "Collapse"}
        placement="right"
        slotProps={{
          tooltip: {},
          popper: {
            sx: {
              cursor: "pointer",
            },
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, -8],
                },
              },
            ],
          },
        }}
      >
        <Box
          component="svg"
          ref={svgRef}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          sx={{
            width: 24,
            stroke: (theme) => theme.vars.palette.background.elevation4,
            height: 24,
          }}
        >
          <path ref={pathRef} d={paths.vertical} />
        </Box>
      </Tooltip>
    </ButtonBase>
  );
};

export default SidenavCollapse;
