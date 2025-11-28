import { format } from "date-fns";

export const formatISO8601 = (date?: Date | null) => {
  if (!date) return null;
  if (date.getFullYear() === 3000) return null;

  return format(date, "yyyy-MM-dd");
};
