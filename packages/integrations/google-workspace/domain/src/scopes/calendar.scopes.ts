export const CalendarScopes = {
  calendar: "https://www.googleapis.com/auth/calendar",
  events: "https://www.googleapis.com/auth/calendar.events",
  readonly: "https://www.googleapis.com/auth/calendar.readonly",
} as const;

export const CALENDAR_REQUIRED_SCOPES = [CalendarScopes.calendar, CalendarScopes.events] as const;
