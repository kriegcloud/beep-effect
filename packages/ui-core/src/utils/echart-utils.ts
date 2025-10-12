import type { CallbackDataParams } from "echarts/types/dist/shared";

export const tooltipFormatterList = (params: CallbackDataParams | CallbackDataParams[], showLabel = false) => {
  const paramsArray = Array.isArray(params) ? params : [params];

  const result = paramsArray.map((param) => {
    const hasSeriesName = !(
      // biome-ignore lint/suspicious/noControlCharactersInRegex: i don't care
      (typeof param.seriesName === "string" && /^series\u0000\d+$/.test(param.seriesName))
    );

    const formattedValue =
      typeof param.value === "number"
        ? Math.abs(param.value) > 1000
          ? `${(param.value / 1000).toFixed(1)}K`
          : param.value
        : param.value;

    return {
      value: formattedValue,
      color: param.color,
      seriesName: hasSeriesName ? param.seriesName : param.name,
    };
  });

  const tooltipItem = result
    .map((el) => {
      return `<div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 120px">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <span style="width: 8px; height: 8px; background: ${el.color}; border-radius: 50%;"></span>
          <span>${el.seriesName}</span>
        </div>
        <span>${el.value}</span>
      </div>`;
    })
    .join("");

  return showLabel
    ? `<div style="margin-left: 8px;">
         <p>${paramsArray[0]?.name}</p>
          ${tooltipItem}
    </div>`
    : `<div style="margin-left: 8px;">
          ${tooltipItem}
    </div>`;
};

export function getColor(colorVar: string) {
  const isVar = colorVar.startsWith("var(") && colorVar.endsWith(")");
  if (!isVar) return colorVar;

  const variableName = colorVar.slice(4, -1).trim();
  const computedStyle = getComputedStyle(document.documentElement);
  return computedStyle.getPropertyValue(variableName).trim() || colorVar;
}
