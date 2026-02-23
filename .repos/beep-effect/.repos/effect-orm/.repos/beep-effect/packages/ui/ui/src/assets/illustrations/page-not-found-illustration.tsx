import { assetPaths } from "@beep/constants";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import SvgIcon from "@mui/material/SvgIcon";
import { memo } from "react";
import { BackgroundShape } from "./background-shape";

type SvgProps = SvgIconProps & { readonly hideBackground?: boolean | undefined };

function PageNotFoundIllustration({ hideBackground, sx, ...other }: SvgProps) {
  const renderCharacterImage = () => (
    <image href={assetPaths.assets.illustrations.characters.characterQuestion} height="280" x="220" y="40" />
  );

  return (
    <SvgIcon
      viewBox="0 0 480 360"
      xmlns="http://www.w3.org/2000/svg"
      sx={[
        (theme) => ({
          "--primary-light": theme.vars.palette.primary.light,
          "--primary-main": theme.vars.palette.primary.main,
          "--primary-dark": theme.vars.palette.primary.dark,
          "--primary-darker": theme.vars.palette.primary.darker,
          width: 320,
          maxWidth: 1,
          flexShrink: 0,
          height: "auto",
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {!hideBackground && <BackgroundShape />}

      {renderCharacterImage()}

      <path fill="#FFAB00" d="M111.1 141.2c58.7-1 58.6-88.3 0-89.2-58.6 1-58.6 88.3 0 89.2z" opacity="0.12" />

      <path fill="#FFD666" d="M111.1 120c30.8-.5 30.8-46.3 0-46.8-30.8.5-30.8 46.3 0 46.8z" />
      <path
        fill="var(--primary-darker)"
        d="M244.9 182.5c82.3 1.4 82.2 123.8 0 125.2-82.3-1.5-82.3-123.8 0-125.2zm0 23.1c-51.8.9-51.8 77.9 0 78.8 51.8-.9 51.7-77.9 0-78.8z"
      />

      <path
        fill="url(#paint0_linear_1_119)"
        d="M175 265.6c1-8.7-12.1-4.8-17-5.6v-66.6c0-4.5-1.5-5.6-5.6-5.6-5.3.3-13.8-1.4-17.1 4l-55 68.3c-2.7 3.3-1.8 8.8-2 12.8 0 4.1 1.5 5.6 5.6 5.6h54.7v21.7c-.9 7.9 9.1 5.2 13.7 5.6 4.1 0 5.6-1.5 5.6-5.6v-21.7c13.8-1.1 18.1 4.5 17.1-12.9zm-72.5-5.6l36-44.4V260h-36zm309.1 5.6c1-8.7-12.2-4.8-17.1-5.6v-66.6c0-4.5-1.5-5.6-5.6-5.6-5.3.3-13.7-1.4-17.1 4l-55 68.3c-2.7 3.3-1.9 8.8-2 12.8 0 4.1 1.5 5.6 5.6 5.6h54.7v21.7c-.9 7.9 9.1 5.2 13.7 5.6 4.1 0 5.6-1.5 5.6-5.6v-21.7c14.1-1.1 18.2 4.5 17.2-12.9zm-72.4-5.6l36-44.4V260h-36z"
      />

      <path
        fill="var(--primary-main)"
        d="M425.6 118.2c0-5-4.6-9-9.6-8.2-2-3.7-6-6-10.2-5.9 4.3-21.4-30-21.4-25.7 0-8.7-.8-15.1 9.4-10.4 16.8 2.1 3.5 5.9 5.6 10 5.5h38.7v-.1c4.1-.4 7.2-3.9 7.2-8.1zM104.3 200c.1-4.2-4.1-7.8-8.2-7-1.7-3.2-5.1-5.1-8.8-5 3.8-18.4-25.8-18.4-22 0-7.4-.7-12.9 8.1-8.9 14.4 1.8 3 5.1 4.8 8.6 4.7h33.2v-.1c3.4-.4 6.1-3.4 6.1-7z"
        opacity="0.08"
      />

      <defs>
        <linearGradient
          id="paint0_linear_1_119"
          x1="78.3"
          x2="78.3"
          y1="187.77"
          y2="305.935"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--primary-light)" />
          <stop offset="1" stopColor="var(--primary-dark)" />
        </linearGradient>
      </defs>
    </SvgIcon>
  );
}

export default memo(PageNotFoundIllustration);
