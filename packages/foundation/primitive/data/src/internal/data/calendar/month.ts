import { formalizeValues } from "../utils.ts";

export const MonthNameValues = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

export const FormalMonthNameValues = formalizeValues(MonthNameValues);

export const MonthNumberValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export const MonthISOValues = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"] as const;
