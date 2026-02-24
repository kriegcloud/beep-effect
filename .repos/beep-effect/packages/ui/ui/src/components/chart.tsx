"use client";

import { BS } from "@beep/schema";
import { cn } from "@beep/ui-core/utils";
import * as A from "effect/Array";
import * as Eq from "effect/Equal";
import * as F from "effect/Function";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import type { Props as DefaultLegendContentProps } from "recharts/types/component/DefaultLegendContent";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: Str.empty, dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    readonly label?: undefined | React.ReactNode;
    readonly icon?: undefined | React.ComponentType;
  } & (
    | { readonly color?: undefined | string; readonly theme?: undefined | never }
    | { readonly color?: undefined | never; readonly theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  readonly config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (P.isNullable(context)) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  readonly config: ChartConfig;
  readonly children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || Str.replace(/:/g, Str.empty)(uniqueId)}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Struct.entries(config).filter(([, config]) => config.theme || config.color);

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Struct.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;
export class ChatTooltipContentIdicator extends BS.StringLiteralKit("line", "dot", "dashed") {}

export declare namespace ChatTooltipContentIdicator {
  export type Type = typeof ChatTooltipContentIdicator.Type;
}
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = ChatTooltipContentIdicator.Enum.dot,
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: RechartsPrimitive.TooltipContentProps<ValueType, NameType> &
  React.ComponentProps<"div"> & {
    readonly hideLabel?: undefined | boolean;
    readonly hideIndicator?: undefined | boolean;
    readonly indicator?: undefined | ChatTooltipContentIdicator.Type;
    readonly nameKey?: undefined | string;
    readonly labelKey?: undefined | string;
  }) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value = !labelKey && P.isString(label) ? config[label]?.label || label : itemConfig?.label;

    if (labelFormatter) {
      return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>;
    }

    if (!value) {
      return null;
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && !ChatTooltipContentIdicator.is.dot(indicator);

  return (
    <div
      className={cn(
        "border-border/50 bg-background gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl grid min-w-[8rem] items-start",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {F.pipe(
          payload,
          A.filter(Eq.equals("none")),
          A.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload.fill || item.color;

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                  ChatTooltipContentIdicator.is.dot(indicator) && "items-center"
                )}
              >
                {formatter && P.isNotUndefined(item?.value) && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)", {
                            "h-2.5 w-2.5": ChatTooltipContentIdicator.is.dot(indicator),
                            "w-1": ChatTooltipContentIdicator.is.line(indicator),
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              ChatTooltipContentIdicator.is.dot(indicator),
                            "my-0.5": nestLabel && ChatTooltipContentIdicator.is.dot(indicator),
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
                        <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
                      </div>
                      {item.value && (
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> &
  Pick<DefaultLegendContentProps, "payload" | "verticalAlign"> & {
    readonly hideIcon?: undefined | boolean;
    readonly nameKey?: undefined | string;
  }) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}>
      {F.pipe(
        payload,
        A.filter(
          (item) =>
            P.isNotNullable(item) &&
            P.isObject(item) &&
            P.hasProperty("type")(item) &&
            P.isString(item.type) &&
            item.type !== "none"
        ),
        A.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={item.value}
              className={cn("[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3")}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
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
        })
      )}
    </div>
  );
}

function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (!P.isObject(payload) || P.isNull(payload)) {
    return undefined;
  }

  const payloadPayload =
    P.hasProperty("payload")(payload) && P.isObject(payload.payload) && P.isNotNull(payload.payload)
      ? payload.payload
      : undefined;

  let configLabelKey = key;

  if (P.hasProperty(key)(payload) && P.isString(payload[key])) {
    configLabelKey = payload[key];
  } else if (P.hasProperty(key)(payloadPayload) && P.isString(payloadPayload[key])) {
    configLabelKey = payloadPayload[key];
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };
