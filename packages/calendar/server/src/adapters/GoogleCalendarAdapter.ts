import { GoogleAuthClient } from "@beep/google-workspace-client";
import {
  CalendarScopes,
  GoogleApiError,
  type GoogleAuthenticationError,
  type GoogleScopeExpansionRequiredError,
} from "@beep/google-workspace-domain";
import { $CalendarServerId } from "@beep/identity/packages";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const $I = $CalendarServerId.create("adapters/GoogleCalendarAdapter");

/**
 * Required OAuth scopes for Google Calendar operations.
 * Events scope allows full CRUD operations on calendar events.
 */
export const REQUIRED_SCOPES: ReadonlyArray<string> = [CalendarScopes.events];

/**
 * Input for creating a new calendar event.
 */
export interface CreateEventInput {
  readonly summary: string;
  readonly description?: string;
  readonly startTime: DateTime.Utc;
  readonly endTime: DateTime.Utc;
  readonly timeZone?: string;
  readonly attendees?: ReadonlyArray<string>;
}

/**
 * Input for updating an existing calendar event.
 */
export interface UpdateEventInput {
  readonly summary?: string;
  readonly description?: string;
  readonly startTime?: DateTime.Utc;
  readonly endTime?: DateTime.Utc;
}

/**
 * Normalized calendar event representation from Google Calendar API.
 */
export interface CalendarEvent {
  readonly id: string;
  readonly summary: string;
  readonly description: O.Option<string>;
  readonly startTime: DateTime.Utc;
  readonly endTime: DateTime.Utc;
  readonly timeZone: string;
  readonly attendees: ReadonlyArray<string>;
  readonly htmlLink: O.Option<string>;
}

/**
 * Google Calendar API event payload structure.
 */
interface GoogleCalendarEventPayload {
  readonly summary: string;
  readonly description?: string | undefined;
  readonly start: {
    readonly dateTime: string;
    readonly timeZone: string;
  };
  readonly end: {
    readonly dateTime: string;
    readonly timeZone: string;
  };
  readonly attendees?: ReadonlyArray<{ email: string }> | undefined;
}

/**
 * Google Calendar API event response structure.
 */
interface GoogleCalendarEventResponse {
  readonly id: string;
  readonly summary?: string;
  readonly description?: string;
  readonly start?: {
    readonly dateTime?: string;
    readonly date?: string;
    readonly timeZone?: string;
  };
  readonly end?: {
    readonly dateTime?: string;
    readonly date?: string;
    readonly timeZone?: string;
  };
  readonly attendees?: ReadonlyArray<{ email?: string }>;
  readonly htmlLink?: string;
}

/**
 * Google Calendar API list events response structure.
 */
interface GoogleCalendarListResponse {
  readonly items?: ReadonlyArray<GoogleCalendarEventResponse>;
  readonly nextPageToken?: string;
}

type GoogleCalendarAdapterError = GoogleApiError | GoogleAuthenticationError | GoogleScopeExpansionRequiredError;

/**
 * GoogleCalendarAdapter provides Effect-based access to Google Calendar API.
 *
 * This adapter translates between the application's calendar domain model and
 * Google Calendar's REST API, handling authentication via GoogleAuthClient.
 */
export class GoogleCalendarAdapter extends Context.Tag($I`GoogleCalendarAdapter`)<
  GoogleCalendarAdapter,
  {
    /**
     * Lists events from a Google Calendar within a time range.
     */
    readonly listEvents: (
      calendarId: string,
      timeMin: DateTime.Utc,
      timeMax: DateTime.Utc,
      providerAccountId: string
    ) => Effect.Effect<ReadonlyArray<CalendarEvent>, GoogleCalendarAdapterError>;

    /**
     * Creates a new event in a Google Calendar.
     */
    readonly createEvent: (
      calendarId: string,
      event: CreateEventInput,
      providerAccountId: string
    ) => Effect.Effect<CalendarEvent, GoogleCalendarAdapterError>;

    /**
     * Updates an existing event in a Google Calendar.
     */
    readonly updateEvent: (
      calendarId: string,
      eventId: string,
      updates: UpdateEventInput,
      providerAccountId: string
    ) => Effect.Effect<CalendarEvent, GoogleCalendarAdapterError>;

    /**
     * Deletes an event from a Google Calendar.
     */
    readonly deleteEvent: (
      calendarId: string,
      eventId: string,
      providerAccountId: string
    ) => Effect.Effect<void, GoogleCalendarAdapterError>;
  }
>() {}

const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";
const DEFAULT_TIMEZONE = "UTC";

/**
 * Live implementation of GoogleCalendarAdapter using Google Calendar REST API.
 *
 * Dependencies:
 * - GoogleAuthClient: For OAuth token management
 * - HttpClient: For making HTTP requests to Google Calendar API
 */
export const GoogleCalendarAdapterLive: Layer.Layer<
  GoogleCalendarAdapter,
  never,
  GoogleAuthClient | HttpClient.HttpClient
> = Layer.effect(
  GoogleCalendarAdapter,
  Effect.gen(function* () {
    const http = yield* HttpClient.HttpClient;
    const auth = yield* GoogleAuthClient;

    // ACL translation: Convert domain input to Google Calendar API format
    const toGoogleFormat = (input: CreateEventInput): GoogleCalendarEventPayload => {
      const timeZone = input.timeZone ?? DEFAULT_TIMEZONE;
      return {
        summary: input.summary,
        description: input.description,
        start: {
          dateTime: DateTime.formatIso(input.startTime),
          timeZone,
        },
        end: {
          dateTime: DateTime.formatIso(input.endTime),
          timeZone,
        },
        attendees: input.attendees ? A.map(input.attendees, (email) => ({ email })) : undefined,
      };
    };

    // ACL translation: Convert Google Calendar API response to domain model
    const fromGoogleFormat = (google: GoogleCalendarEventResponse): CalendarEvent => {
      const parseDateTime = (dt?: { dateTime?: string; date?: string }): DateTime.Utc => {
        if (dt?.dateTime) {
          // Parse ISO string directly - Date.parse returns milliseconds
          return DateTime.unsafeMake(Date.parse(dt.dateTime));
        }
        if (dt?.date) {
          // Parse date string (YYYY-MM-DD format from Google)
          return DateTime.unsafeMake(Date.parse(dt.date));
        }
        // Use epoch as fallback for missing datetime - this indicates malformed API response
        return DateTime.unsafeMake(0);
      };

      return {
        id: google.id,
        summary: google.summary ?? "",
        description: O.fromNullable(google.description),
        startTime: parseDateTime(google.start),
        endTime: parseDateTime(google.end),
        timeZone: google.start?.timeZone ?? DEFAULT_TIMEZONE,
        attendees: A.filterMap(google.attendees ?? [], (a) => O.fromNullable(a.email)),
        htmlLink: O.fromNullable(google.htmlLink),
      };
    };

    // Helper to create API error from HTTP response
    const makeApiError = (message: string, statusCode: number, endpoint: string): GoogleApiError =>
      new GoogleApiError({
        message,
        statusCode,
        endpoint,
      });

    return GoogleCalendarAdapter.of({
      listEvents: Effect.fn("GoogleCalendarAdapter.listEvents")(function* (
        calendarId: string,
        timeMin: DateTime.Utc,
        timeMax: DateTime.Utc,
        providerAccountId: string
      ) {
        const token = yield* auth.getValidToken(REQUIRED_SCOPES, providerAccountId);
        const accessToken = O.getOrThrow(token.accessToken);

        const endpoint = `/calendars/${encodeURIComponent(calendarId)}/events`;
        const request = HttpClientRequest.get(`${GOOGLE_CALENDAR_API_BASE}${endpoint}`).pipe(
          HttpClientRequest.setHeader("Authorization", `Bearer ${accessToken}`),
          HttpClientRequest.setUrlParams({
            timeMin: DateTime.formatIso(timeMin),
            timeMax: DateTime.formatIso(timeMax),
            singleEvents: "true",
            orderBy: "startTime",
          })
        );

        const response = yield* http
          .execute(request)
          .pipe(Effect.mapError((e) => makeApiError(`HTTP request failed: ${e.message}`, 500, endpoint)));

        if (response.status >= 400) {
          const body = yield* response.text.pipe(
            Effect.mapError((e) =>
              makeApiError(`Failed to read error response: ${e.message}`, response.status, endpoint)
            )
          );
          return yield* new GoogleApiError({
            message: `Failed to list events: ${body}`,
            statusCode: response.status,
            endpoint,
          });
        }

        const json = yield* response.json.pipe(
          Effect.mapError((e) => makeApiError(`Failed to parse JSON response: ${e.message}`, 500, endpoint))
        );

        const listResponse = json as GoogleCalendarListResponse;
        return A.map(listResponse.items ?? [], fromGoogleFormat);
      }),

      createEvent: Effect.fn("GoogleCalendarAdapter.createEvent")(function* (
        calendarId: string,
        event: CreateEventInput,
        providerAccountId: string
      ) {
        const token = yield* auth.getValidToken(REQUIRED_SCOPES, providerAccountId);
        const accessToken = O.getOrThrow(token.accessToken);

        const endpoint = `/calendars/${encodeURIComponent(calendarId)}/events`;
        const payload = toGoogleFormat(event);

        const request = yield* HttpClientRequest.post(`${GOOGLE_CALENDAR_API_BASE}${endpoint}`).pipe(
          HttpClientRequest.setHeader("Authorization", `Bearer ${accessToken}`),
          HttpClientRequest.setHeader("Content-Type", "application/json"),
          HttpClientRequest.bodyJson(payload),
          Effect.mapError((e) => makeApiError(`Failed to serialize request body: ${String(e)}`, 500, endpoint))
        );

        const response = yield* http
          .execute(request)
          .pipe(Effect.mapError((e) => makeApiError(`HTTP request failed: ${e.message}`, 500, endpoint)));

        if (response.status >= 400) {
          const body = yield* response.text.pipe(
            Effect.mapError((e) =>
              makeApiError(`Failed to read error response: ${e.message}`, response.status, endpoint)
            )
          );
          return yield* new GoogleApiError({
            message: `Failed to create event: ${body}`,
            statusCode: response.status,
            endpoint,
          });
        }

        const json = yield* response.json.pipe(
          Effect.mapError((e) => makeApiError(`Failed to parse JSON response: ${e.message}`, 500, endpoint))
        );

        return fromGoogleFormat(json as GoogleCalendarEventResponse);
      }),

      updateEvent: Effect.fn("GoogleCalendarAdapter.updateEvent")(function* (
        calendarId: string,
        eventId: string,
        updates: UpdateEventInput,
        providerAccountId: string
      ) {
        const token = yield* auth.getValidToken(REQUIRED_SCOPES, providerAccountId);
        const accessToken = O.getOrThrow(token.accessToken);

        const endpoint = `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;

        // Build patch payload with only provided fields
        interface PatchPayload {
          summary?: string;
          description?: string;
          start?: { dateTime: string; timeZone: string };
          end?: { dateTime: string; timeZone: string };
        }
        const patchPayload: PatchPayload = {};
        if (updates.summary !== undefined) {
          patchPayload.summary = updates.summary;
        }
        if (updates.description !== undefined) {
          patchPayload.description = updates.description;
        }
        if (updates.startTime !== undefined) {
          patchPayload.start = {
            dateTime: DateTime.formatIso(updates.startTime),
            timeZone: DEFAULT_TIMEZONE,
          };
        }
        if (updates.endTime !== undefined) {
          patchPayload.end = {
            dateTime: DateTime.formatIso(updates.endTime),
            timeZone: DEFAULT_TIMEZONE,
          };
        }

        const request = yield* HttpClientRequest.patch(`${GOOGLE_CALENDAR_API_BASE}${endpoint}`).pipe(
          HttpClientRequest.setHeader("Authorization", `Bearer ${accessToken}`),
          HttpClientRequest.setHeader("Content-Type", "application/json"),
          HttpClientRequest.bodyJson(patchPayload),
          Effect.mapError((e) => makeApiError(`Failed to serialize request body: ${String(e)}`, 500, endpoint))
        );

        const response = yield* http
          .execute(request)
          .pipe(Effect.mapError((e) => makeApiError(`HTTP request failed: ${e.message}`, 500, endpoint)));

        if (response.status >= 400) {
          const body = yield* response.text.pipe(
            Effect.mapError((e) =>
              makeApiError(`Failed to read error response: ${e.message}`, response.status, endpoint)
            )
          );
          return yield* new GoogleApiError({
            message: `Failed to update event: ${body}`,
            statusCode: response.status,
            endpoint,
          });
        }

        const json = yield* response.json.pipe(
          Effect.mapError((e) => makeApiError(`Failed to parse JSON response: ${e.message}`, 500, endpoint))
        );

        return fromGoogleFormat(json as GoogleCalendarEventResponse);
      }),

      deleteEvent: Effect.fn("GoogleCalendarAdapter.deleteEvent")(function* (
        calendarId: string,
        eventId: string,
        providerAccountId: string
      ) {
        const token = yield* auth.getValidToken(REQUIRED_SCOPES, providerAccountId);
        const accessToken = O.getOrThrow(token.accessToken);

        const endpoint = `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;

        const request = HttpClientRequest.del(`${GOOGLE_CALENDAR_API_BASE}${endpoint}`).pipe(
          HttpClientRequest.setHeader("Authorization", `Bearer ${accessToken}`)
        );

        const response = yield* http
          .execute(request)
          .pipe(Effect.mapError((e) => makeApiError(`HTTP request failed: ${e.message}`, 500, endpoint)));

        // 204 No Content is the expected success response for DELETE
        if (response.status >= 400) {
          const body = yield* response.text.pipe(
            Effect.mapError((e) =>
              makeApiError(`Failed to read error response: ${e.message}`, response.status, endpoint)
            )
          );
          return yield* new GoogleApiError({
            message: `Failed to delete event: ${body}`,
            statusCode: response.status,
            endpoint,
          });
        }
      }),
    });
  })
);
