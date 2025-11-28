import { z } from "zod";

const dateRegex = /^([12]\d{3}-[01]\d-[0-3]\d|[12]\d{3}-[01]\d|[12]\d{3})$/;

export const iso8601Schema = z
  .string()
  .regex(dateRegex, {
    message: "Invalid date format. Expected formats are YYYY-MM-DD, YYYY-MM, or YYYY.",
  })
  .or(z.literal(""))
  .describe(
    "Similar to the standard date type, but each section after the year is optional. e.g. 2014-06-29 or 2023-04"
  );
