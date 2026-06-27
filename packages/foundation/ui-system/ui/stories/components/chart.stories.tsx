import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@beep/ui/components/chart";
import { A, Str } from "@beep/utils";
import { Effect, pipe } from "effect";
import * as O from "effect/Option";
import {
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LineChart,
  PieChart,
  Area as RechartsArea,
  Line as RechartsLine,
  Pie as RechartsPie,
  Sector,
  XAxis,
} from "recharts";
import { expect, within } from "storybook/test";
import type { ChartConfig } from "@beep/ui/components/chart";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PieSectorShapeProps } from "recharts";

/**
 * `ChartContainer` is the responsive root of the chart system, built on Recharts. It
 * provides the chart config context and injects per-series theme CSS variables
 * (`--color-<key>`) consumed by the underlying Recharts primitives. Compose it with
 * Recharts components (`BarChart`, `LineChart`, `AreaChart`, `PieChart`, axes, grids)
 * and the themed helpers `ChartTooltip` + `ChartTooltipContent` and `ChartLegend` +
 * `ChartLegendContent` to build a complete chart.
 *
 * The `config` prop maps each data series key to a `label`, optional `icon`, and a
 * `color` (or per-theme colors). Series fills then reference `var(--color-<key>)`.
 *
 * Imported from `@beep/ui/components/chart`.
 */
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
] as const;

const chartConfig = {
  desktop: { label: "Desktop", color: "#2563eb" },
  mobile: { label: "Mobile", color: "#60a5fa" },
} satisfies ChartConfig;

const browserData = [
  { browser: "chrome", visitors: 275, fill: "#2563eb" },
  { browser: "safari", visitors: 200, fill: "#60a5fa" },
  { browser: "firefox", visitors: 187, fill: "#93c5fd" },
  { browser: "edge", visitors: 173, fill: "#1d4ed8" },
] as const;

const fallbackPieFill = "var(--color-chrome)";
const pieSectorFill = (index: number): string =>
  pipe(
    A.get(browserData, index),
    O.map((entry) => entry.fill),
    O.getOrElse(() => fallbackPieFill)
  );

const renderPieSector = (props: PieSectorShapeProps, index?: string | number) => {
  const sectorIndex = typeof index === "number" ? index : Number(index ?? 0);
  const cornerRadiusProps = props.cornerRadius === undefined ? {} : { cornerRadius: props.cornerRadius };

  return (
    <Sector
      cx={props.cx}
      cy={props.cy}
      innerRadius={props.innerRadius}
      outerRadius={props.outerRadius}
      startAngle={props.startAngle}
      endAngle={props.endAngle}
      {...cornerRadiusProps}
      fill={pieSectorFill(sectorIndex)}
    />
  );
};

const pieConfig = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "#2563eb" },
  safari: { label: "Safari", color: "#60a5fa" },
  firefox: { label: "Firefox", color: "#93c5fd" },
  edge: { label: "Edge", color: "#1d4ed8" },
} satisfies ChartConfig;

const monthTickFormatter = (value: string): string => Str.slice(0, 3)(value);

// `ChartContainer` requires a single Recharts `children` element, so the story args type
// treats `children` as required. Every story supplies its own composition through `render`,
// so this default only satisfies the type and is never the rendered output.
const defaultChartChildren = (
  <BarChart accessibilityLayer data={[...chartData]}>
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} isAnimationActive={false} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} isAnimationActive={false} />
  </BarChart>
);

const meta = {
  title: "Components/Data Display/Chart",
  component: ChartContainer,
  tags: ["autodocs"],
  argTypes: {
    config: {
      control: false,
      description: "Maps each series key to its label, optional icon, and color (or per-theme colors).",
    },
    className: {
      control: "text",
      description: "Additional classes merged onto the chart wrapper (e.g. sizing constraints).",
    },
    initialDimension: {
      control: false,
      description: "Starting width/height for the responsive container before layout is measured.",
      table: { defaultValue: { summary: "{ width: 320, height: 200 }" } },
    },
    children: {
      control: false,
      description: "A single Recharts chart element (e.g. `BarChart`, `LineChart`, `PieChart`).",
    },
  },
  args: {
    config: chartConfig,
    className: "min-h-[200px] w-full max-w-xl",
    children: defaultChartChildren,
    style: { width: 576, height: 324 },
  },
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The canonical bar chart: two series rendered from `chartConfig`, each bar filled with
 * its `var(--color-<key>)` variable injected by the container.
 */
export const Default: Story = {
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={[...chartData]}>
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} isAnimationActive={false} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  ),
  play: ({ canvasElement }) => {
    const chart = canvasElement.querySelector('[data-slot="chart"]');
    expect(chart).not.toBeNull();
    expect(chart).toHaveAttribute("data-chart");
  },
};

/**
 * A bar chart with a labeled X axis and horizontal grid lines, the most common
 * dashboard configuration.
 */
export const BarWithAxis: Story = {
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={[...chartData]}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={monthTickFormatter} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} isAnimationActive={false} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  ),
};

/**
 * Adds the themed `ChartTooltip` with `ChartTooltipContent`, which reads the active
 * payload and renders each series' label, color indicator, and value on hover.
 */
export const WithTooltip: Story = {
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={[...chartData]}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={monthTickFormatter} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} isAnimationActive={false} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  ),
};

/**
 * Adds the themed `ChartLegend` with `ChartLegendContent`, which renders a swatch and
 * label for each configured series below the plot.
 */
export const WithLegend: Story = {
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={[...chartData]}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={monthTickFormatter} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} isAnimationActive={false} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  ),
  play: ({ canvasElement }) =>
    Effect.runPromise(
      Effect.gen(function* () {
        const canvas = within(canvasElement);
        const desktop = yield* Effect.promise(() => canvas.findByText("Desktop"));
        expect(desktop).toBeVisible();
        const mobile = yield* Effect.promise(() => canvas.findByText("Mobile"));
        expect(mobile).toBeVisible();
      })
    ),
};

/** A line chart driven by the same config, ideal for showing trends over time. */
export const Line: Story = {
  render: (args) => (
    <ChartContainer {...args}>
      <LineChart accessibilityLayer data={[...chartData]}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={monthTickFormatter} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <RechartsLine
          dataKey="desktop"
          stroke="var(--color-desktop)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <RechartsLine
          dataKey="mobile"
          stroke="var(--color-mobile)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  ),
};

/** An area chart with stacked, semi-transparent fills for cumulative comparisons. */
export const Area: Story = {
  render: (args) => (
    <ChartContainer {...args}>
      <AreaChart accessibilityLayer data={[...chartData]}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={monthTickFormatter} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <RechartsArea
          dataKey="mobile"
          type="natural"
          fill="var(--color-mobile)"
          fillOpacity={0.4}
          stroke="var(--color-mobile)"
          stackId="a"
          isAnimationActive={false}
        />
        <RechartsArea
          dataKey="desktop"
          type="natural"
          fill="var(--color-desktop)"
          fillOpacity={0.4}
          stroke="var(--color-desktop)"
          stackId="a"
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  ),
};

/**
 * A pie chart where each slice references its own `fill` from the data, with a legend
 * mapping slices to their configured labels via `nameKey`.
 */
export const Pie: Story = {
  args: { config: pieConfig, className: "mx-auto", style: { width: 260, height: 260 } },
  render: (args) => (
    <ChartContainer {...args}>
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="visitors" hideLabel />} />
        <RechartsPie
          data={[...browserData]}
          dataKey="visitors"
          nameKey="browser"
          shape={renderPieSector}
          isAnimationActive={false}
        />
        <ChartLegend content={<ChartLegendContent nameKey="browser" />} />
      </PieChart>
    </ChartContainer>
  ),
  play: ({ canvasElement }) =>
    Effect.runPromise(
      Effect.gen(function* () {
        const canvas = within(canvasElement);
        const chrome = yield* Effect.promise(() => canvas.findByText("Chrome"));
        expect(chrome).toBeVisible();
        const safari = yield* Effect.promise(() => canvas.findByText("Safari"));
        expect(safari).toBeVisible();
      })
    ),
};

/**
 * The tooltip content supports three indicator styles. Here the `dashed` indicator is
 * paired with a single series, demonstrating the nested-label layout.
 */
export const DashedTooltip: Story = {
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={[...chartData]}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={monthTickFormatter} />
        <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  ),
};
