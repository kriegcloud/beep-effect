import { compareDesc, parseISO } from "date-fns";

// Helper function to parse dates
function parseDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date(0); // Default to earliest date for missing values

  // Handle partial dates by appending missing parts
  const parts = dateStr.split("-");

  while (parts.length < 3) {
    parts.push("01"); // Append '01' for missing month/day
  }

  return parseISO(parts.join("-"));
}

export const compareISO8601 =
  (keys: string | [string, string] = ["startDate", "endDate"]) =>
  (a: Record<string, string | null | undefined>, b: Record<string, string | null | undefined>) => {
    if (typeof keys === "string") {
      keys = [keys, keys];
    }

    const [startKey, endKey] = keys;

    // Treat missing endDate as more recent (assuming ongoing work)
    const aEndDate = a[endKey] ? parseDate(a[endKey]) : new Date();
    const bEndDate = b[endKey] ? parseDate(b[endKey]) : new Date();

    const endComparison = compareDesc(aEndDate, bEndDate);

    if (endComparison !== 0) return endComparison;

    // Compare start dates if end dates are the same or missing
    const aStartDate = a[startKey] ? parseDate(a[startKey]) : new Date(0);
    const bStartDate = b[startKey] ? parseDate(b[startKey]) : new Date(0);

    return compareDesc(aStartDate, bStartDate);
  };
