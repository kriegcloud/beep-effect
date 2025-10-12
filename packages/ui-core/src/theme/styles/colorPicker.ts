import { grey } from "@beep/ui-core/theme/core/palette";
import { typography } from "@beep/ui-core/theme/core/typography";
import type { Theme } from "@mui/material/styles";

const colorPicker = (theme: Theme) => {
  return {
    "& .w-color-sketch ": {
      width: "100% !important",
      background: "transparent !important",
      borderRadius: "0 !important",
      boxShadow: "none !important",

      "& div:first-of-type": {
        padding: "0 !important",

        "& .w-color-saturation": {
          height: "220px !important",

          "& .w-color-saturation-fill": {
            width: "12px !important",
            height: "12px !important",
          },
        },

        "& .w-color-saturation + div:last-of-type": {
          margin: "0 !important",
          padding: "16px !important",
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: "8px",

          "& > div:first-of-type > div": {
            height: "13px !important",
            borderRadius: "8px !important",
            overflow: "hidden",

            "& .w-color-interactive > div": {
              width: "9px !important",
              height: "9px !important",
              top: "50% !important",
              bottom: "0px !important",
              transform: "translateY(-50%)",
              boxShadow:
                "rgb(255 255 255) 0px 0px 0px 1.5px, rgb(0 0 0 / 10%) 0px 0px 1px 1px inset, rgb(0 0 0 / 10%) 0px 0px 1px 2px !important",
              background: "transparent !important",
              borderRadius: "50% !important",
            },
          },

          "& > div:last-of-type": {
            width: "30px !important",
            height: "30px !important",
            backgroundColor: `${theme.vars.palette.background.default} !important`,
            borderRadius: "4px !important",
            overflow: "hidden",

            "& > div:last-of-type": {
              boxShadow: "none !important",
            },
          },
        },
      },

      "& > div:nth-of-type(2)": {
        display: "none !important",
      },

      "& > div:nth-of-type(3)": {
        display: "none !important",
      },
    },

    "& .w-color-editable-input": {
      flex: 1,
      "&:last-of-type": {
        flex: 1.5,
      },
      "& > input": {
        height: "100% !important",
        textAlign: "center",
        textTransform: "uppercase",
        fontSize: "14px !important",
        boxShadow: "none !important",
        outline: "none !important",
        fontFamily: typography.fontFamily,
        borderRadius: "4px !important",
        color: `${theme.vars.palette.text.secondary} !important`,
        background: `${grey[100]} !important`,
        ...theme.applyStyles("dark", {
          background: `${grey[800]} !important`,
        }),
      },

      "& > span": {
        display: "none !important",
      },
    },

    "& .w-color-swatch": {
      display: "grid !important",
      gridTemplateColumns: "repeat(10, 1fr)",
      gap: 8,

      "& > div": {
        margin: "0 !important",
        height: "24px !important",
        width: "100% !important",
      },
    },
  };
};

export default colorPicker;
