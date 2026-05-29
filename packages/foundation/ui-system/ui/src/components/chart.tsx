"use client";

import { cn } from "@beep/ui/lib/utils";
import { A, P, Str, Struct } from "@beep/utils";
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import type { TooltipValueType } from "recharts";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

const INITIAL_DIMENSION = { width: 320, height: 200 } as const;
type TooltipNameType = number | string;

/**
 * Configuration describing each chart series' label, icon, and color or per-theme colors.
 *
 * @category components
 * @since 0.0.0
 */
export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> })
>;

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (context === null) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

/**
 * Responsive chart wrapper that provides the chart config context and theme CSS variables.
 *
 * @category components
 * @since 0.0.0
 */
function ChartContainer({
  id,
  className,
  children,
  config,
  initialDimension = INITIAL_DIMENSION,
  ...props
}: React.ComponentProps<"div"> & {
  readonly config: ChartConfig;
  readonly children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  readonly initialDimension?: {
    readonly width: number;
    readonly height: number;
  };
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? Str.replace(/:/g, "")(uniqueId)}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer initialDimension={initialDimension}>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

/**
 * Injects per-theme CSS custom properties for a chart's configured series colors.
 *
 * @category components
 * @since 0.0.0
 */
const ChartStyle = ({ id, config }: { readonly id: string; readonly config: ChartConfig }) => {
  const colorConfig = A.filter(
    Struct.entries(config),
    ([, itemConfig]) => (itemConfig.theme ?? itemConfig.color) !== undefined
  );

  if (colorConfig.length === 0) {
    return null;
  }

  return (
    <style
      // biome-ignore lint/security/noDangerouslySetInnerHtml: canonical shadcn ChartStyle pattern injecting theme CSS variables from developer-controlled chart config (no user input)
      dangerouslySetInnerHTML={{
        __html: A.join(
          A.map(
            Struct.entries(THEMES),
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${A.join(
  A.map(colorConfig, ([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ?? itemConfig.color;
    return color !== undefined ? `  --color-${key}: ${color};` : "";
  }),
  "\n"
)}
}
`
          ),
          "\n"
        ),
      }}
    />
  );
};

/**
 * Recharts tooltip primitive paired with {@link ChartTooltipContent}.
 *
 * @category components
 * @since 0.0.0
 */
const ChartTooltip = RechartsPrimitive.Tooltip;

/**
 * Themed tooltip content for charts, rendering the active payload's label, indicator, and values.
 *
 * @category components
 * @since 0.0.0
 */
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    readonly hideLabel?: boolean;
    readonly hideIndicator?: boolean;
    readonly indicator?: "line" | "dot" | "dashed";
    readonly nameKey?: string;
    readonly labelKey?: string;
  } & Omit<RechartsPrimitive.DefaultTooltipContentProps<TooltipValueType, TooltipNameType>, "accessibilityLayer">) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || (payload?.length ?? 0) === 0) {
      return null;
    }

    const [item] = payload ?? [];
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value = labelKey === undefined && P.isString(label) ? (config[label]?.label ?? label) : itemConfig?.label;

    if (labelFormatter !== undefined) {
      return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload ?? [])}</div>;
    }

    if (value === undefined || value === null) {
      return null;
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

  if (active !== true || (payload?.length ?? 0) === 0) {
    return null;
  }

  const items = payload ?? [];
  const nestLabel = items.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {A.map(
          A.filter(items, (item) => item.type !== "none"),
          (item, index) => {
            const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color ?? item.payload?.fill ?? item.color;
            const ItemIcon = itemConfig?.icon;

            return (
              <div
                key={`${item.dataKey ?? item.name ?? index}`}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter !== undefined && item?.value !== undefined && item.name !== undefined ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {ItemIcon !== undefined ? (
                      <ItemIcon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)", {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          })}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
                      </div>
                      {item.value != null && (
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {P.isNumber(item.value)
                            ? item.value.toLocaleString()
                            : P.isString(item.value)
                              ? item.value
                              : A.join(
                                  A.map(item.value, (entry) => `${entry}`),
                                  ", "
                                )}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

/**
 * Recharts legend primitive paired with {@link ChartLegendContent}.
 *
 * @category components
 * @since 0.0.0
 */
const ChartLegend = RechartsPrimitive.Legend;

/**
 * Themed legend content for charts, rendering each series' icon or color swatch and label.
 *
 * @category components
 * @since 0.0.0
 */
function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> & {
  readonly hideIcon?: boolean;
  readonly nameKey?: string;
} & RechartsPrimitive.DefaultLegendContentProps) {
  const { config } = useChart();

  if ((payload?.length ?? 0) === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}>
      {A.map(
        A.filter(payload ?? [], (item) => item.type !== "none"),
        (item, index) => {
          const key = `${nameKey ?? item.dataKey ?? "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const LegendIcon = itemConfig?.icon;

          return (
            <div
              key={`${item.dataKey ?? index}`}
              className={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground")}
            >
              {LegendIcon !== undefined && !hideIcon ? (
                <LegendIcon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        }
      )}
    </div>
  );
}

function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (!P.isObject(payload)) {
    return undefined;
  }

  const payloadPayload = "payload" in payload && P.isObject(payload.payload) ? payload.payload : undefined;

  let configLabelKey: string = key;

  if (key in payload && P.isString(payload[key as keyof typeof payload])) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload !== undefined &&
    key in payloadPayload &&
    P.isString(payloadPayload[key as keyof typeof payloadPayload])
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

/**
 * @category components
 * @since 0.0.0
 */
export { ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent };
