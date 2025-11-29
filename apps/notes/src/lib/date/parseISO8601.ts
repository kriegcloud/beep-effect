import { parseISO } from "date-fns";

export const parseISO8601 = (date?: undefined | string | null, nullAsFuture?: undefined | boolean) => {
  if (!date) {
    return nullAsFuture ? parseISO("3000-01-01Z") : null;
  }

  return parseISO(`${date}Z`);
};
