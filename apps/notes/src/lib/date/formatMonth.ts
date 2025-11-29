import { format, parseISO } from "date-fns";

export const formatYear = (date?: undefined | Date | null) => {
  if (!date) return null;

  return format(date, "yyyy");
};

export const formatMonth = (date?: undefined | Date | null) => {
  if (!date) return null;

  return format(date, "MM") as "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12";
};

export const parseYM = (year?: undefined | string | null, month = "01") => {
  if (!year) return null;

  return parseISO(`${year}-${month!.padStart(2, "0")}-01Z`);
};
