import { formalizeValues } from "../utils.js";

export const WeekNameValues = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export const FormalWeekNameValues = formalizeValues(WeekNameValues);
