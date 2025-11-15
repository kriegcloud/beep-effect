import type { SxProps, Theme } from "@mui/material/styles";
import type { ApexOptions } from "apexcharts";
import type { Props as ApexProps } from "react-apexcharts";

export type ChartOptions = ApexOptions;

export type ChartProps = React.ComponentProps<"div"> &
  Pick<ApexProps, "type" | "series" | "options"> & {
    sx?: SxProps<Theme>;
    slotProps?: {
      loading?: SxProps<Theme> | undefined;
    };
  };
