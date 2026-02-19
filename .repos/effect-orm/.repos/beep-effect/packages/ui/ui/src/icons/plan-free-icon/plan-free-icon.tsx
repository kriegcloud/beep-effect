import type { SvgIconProps } from "@mui/material/SvgIcon";
import SvgIcon from "@mui/material/SvgIcon";
import { memo } from "react";

function PlanFreeIcon({ sx, ...other }: SvgIconProps) {
  return (
    <SvgIcon
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      sx={[
        (theme) => ({
          "--primary-main": theme.vars.palette.primary.main,
          "--primary-dark": theme.vars.palette.primary.dark,
          "--primary-darker": theme.vars.palette.primary.darker,
          width: 48,
          flexShrink: 0,
          height: "auto",
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <g transform="translate(9.167 20)">
        <path fill="var(--primary-dark)" d="M53.333 17.5H61.666V25H53.333z" />

        <path
          fill="var(--primary-darker)"
          d="M.935 20.489l25.028-12.46a5.044 5.044 0 014.52.012L60.74 23.307a1.69 1.69 0 01.015 3.007l-25.338 13.12a5.044 5.044 0 01-4.694-.028L.893 23.49a1.69 1.69 0 01.042-3.001z"
        />

        <path
          fill="var(--primary-dark)"
          d="M32.5 34.268v4.193a1.134 1.134 0 01-1.566 1.049l-.1-.047v-7.551a2.498 2.498 0 011.666 2.356zM.833 15.962l30 15.95v7.55l-30-15.952v-.02l-.115-.066A1.571 1.571 0 010 22.104v-7.937l.833 1.795z"
        />

        <path
          fill="var(--primary-main)"
          fillRule="nonzero"
          d="M.935 12.989L25.963.529a5.044 5.044 0 014.52.012L60.74 15.807a1.69 1.69 0 01.015 3.007l-25.338 13.12a5.044 5.044 0 01-4.694-.028L.893 15.99a1.69 1.69 0 01.042-3.001z"
        />
      </g>
    </SvgIcon>
  );
}

export default memo(PlanFreeIcon);
