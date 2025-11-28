export function nFormatter(num: number, digits?: number) {
  if (!num) return "0";

  const lookup = [
    { symbol: "", value: 1 },
    { symbol: "K", value: 1e3 },
    { symbol: "M", value: 1e6 },
    { symbol: "G", value: 1e9 },
    { symbol: "T", value: 1e12 },
    { symbol: "P", value: 1e15 },
    { symbol: "E", value: 1e18 },
  ];
  const rx = /\.0+$|(\.\d*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find((item) => num >= item.value);

  return item ? (num / item.value).toFixed(digits || 1).replace(rx, "$1") + item.symbol : "0";
}
