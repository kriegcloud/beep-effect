const roundDigit = (value: number) => {
  return Math.round(value * 10) / 10;
};

export const formatNumber = (value?: number) => {
  return value ? Intl.NumberFormat().format(value) : 0;
};

export const shortNumber = (value: number, all = false) => {
  if (value >= 100_000_000) {
    return `${roundDigit(value / 1_000_000).toFixed(0)}M`;
  }
  if (value >= 1_000_000) {
    return `${roundDigit(value / 1_000_000)
      .toFixed(1)
      .replace(/\.0$/, "")}M`;
  }
  if (value >= 10_000) {
    return `${roundDigit(value / 1000)
      .toFixed(1)
      .replace(/\.0$/, "")}k`;
  }
  if (all && value >= 1000) {
    return `${roundDigit(value / 1000)
      .toFixed(1)
      .replace(/\.0$/, "")}k`;
  }
  return formatNumber(value);
};
