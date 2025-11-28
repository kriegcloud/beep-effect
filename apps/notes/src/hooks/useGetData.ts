import { format, formatDistance } from "date-fns";
import { useCallback, useMemo, useState } from "react";

type Dates = "date" | "distance";

export const getDate = (dateToFormat: Date | number) => {
  return format(dateToFormat, "HH:mm - dd/MM/yyyy");
};

/**
 * Gets the formatted date based on the provided dateToFormat. If the
 * dateToFormat is not provided, the formatted date will be undefined.
 */
export const useGetDate = (dateToFormat?: Date | number) => {
  const [selectedDateType, setSelectedDateType] = useState<Dates>("distance");
  const isDistance = selectedDateType === "distance";

  const formattedDate: Record<Dates, string> | undefined = useMemo(() => {
    if (dateToFormat) {
      return {
        date: getDate(dateToFormat),
        distance: formatDistance(dateToFormat, new Date(), {
          addSuffix: true,
        }),
      };
    }
  }, [dateToFormat]);

  const toggleDateType = useCallback(() => {
    setSelectedDateType(isDistance ? "date" : "distance");
  }, [isDistance]);

  const date = isDistance ? formattedDate?.distance : formattedDate?.date;

  return { date, isDistance, toggleDateType };
};
