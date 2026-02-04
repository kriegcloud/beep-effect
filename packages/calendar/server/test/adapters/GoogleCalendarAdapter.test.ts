/**
 * GoogleCalendarAdapter Integration Tests
 *
 * Tests the adapter using mocked GoogleAuthClient and HttpClient
 * to verify correct API interaction patterns.
 *
 * @module calendar-server/test/adapters/GoogleCalendarAdapter.test
 * @since 0.1.0
 */
import {
  type CreateEventInput,
  GoogleCalendarAdapter,
  GoogleCalendarAdapterLive,
  REQUIRED_SCOPES,
} from "@beep/calendar-server/adapters";
import { GoogleAuthClient } from "@beep/google-workspace-client";
import {
  CalendarScopes,
  GoogleApiError,
  GoogleAuthenticationError,
  GoogleOAuthToken,
  GoogleScopeExpansionRequiredError,
} from "@beep/google-workspace-domain";
import { describe, effect, layer, strictEqual, assertTrue } from "@beep/testkit";
import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const MockGoogleAuthClient = Layer.succeed(
  GoogleAuthClient,
  GoogleAuthClient.of({
    getValidToken: (_scopes) =>
      Effect.succeed(
        new GoogleOAuthToken({
          accessToken: O.some("mock-access-token"),
          refreshToken: O.none(),
          scope: O.some(CalendarScopes.events),
          tokenType: O.some("Bearer"),
          expiryDate: O.some(DateTime.add(DateTime.unsafeNow(), { hours: 1 })),
        })
      ),
    refreshToken: () =>
      Effect.fail(
        new GoogleAuthenticationError({
          message: "Mock client does not support refresh",
        })
      ),
  })
);

const MockGoogleAuthClientMissingScopes = Layer.succeed(
  GoogleAuthClient,
  GoogleAuthClient.of({
    getValidToken: (requiredScopes) =>
      Effect.fail(
        new GoogleScopeExpansionRequiredError({
          message: "Missing required scopes",
          currentScopes: [],
          requiredScopes: A.fromIterable(requiredScopes),
          missingScopes: A.fromIterable(requiredScopes),
        })
      ),
    refreshToken: () =>
      Effect.fail(
        new GoogleAuthenticationError({
          message: "Mock client does not support refresh",
        })
      ),
  })
);

const makeHttpClientMock = (
  handler: (
    request: HttpClientRequest.HttpClientRequest
  ) => Effect.Effect<{ status: number; body: unknown }, never, never>
) =>
  Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request) =>
      Effect.gen(function* () {
        const result = yield* handler(request);
        return HttpClientResponse.fromWeb(
          request,
          new Response(JSON.stringify(result.body), {
            status: result.status,
            headers: { "Content-Type": "application/json" },
          })
        );
      })
    )
  );

describe("GoogleCalendarAdapter", () => {
  describe("listEvents", () => {
    const mockListEventsResponse = {
      items: [
        {
          id: "event-1",
          summary: "Team Meeting",
          description: "Weekly sync",
          start: {
            dateTime: "2024-01-15T10:00:00Z",
            timeZone: "UTC",
          },
          end: {
            dateTime: "2024-01-15T11:00:00Z",
            timeZone: "UTC",
          },
          attendees: [{ email: "user@example.com" }],
          htmlLink: "https://calendar.google.com/event/1",
        },
        {
          id: "event-2",
          summary: "Standup",
          start: {
            dateTime: "2024-01-15T14:00:00Z",
            timeZone: "UTC",
          },
          end: {
            dateTime: "2024-01-15T14:30:00Z",
            timeZone: "UTC",
          },
          attendees: [],
        },
      ],
    };

    const MockHttpClient = makeHttpClientMock((request) => {
      const url = request.url;
      if (url.includes("/calendars/primary/events")) {
        return Effect.succeed({ status: 200, body: mockListEventsResponse });
      }
      return Effect.succeed({ status: 404, body: { error: "Not found" } });
    });

    const TestLayer = GoogleCalendarAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClient),
      Layer.provide(MockHttpClient)
    );

    layer(TestLayer, { timeout: Duration.seconds(30) })("listEvents tests", (it) => {
      it.effect("returns calendar events from API", () =>
        Effect.gen(function* () {
          const adapter = yield* GoogleCalendarAdapter;
          const now = DateTime.unsafeNow();
          const weekLater = DateTime.add(now, { days: 7 });

          const events = yield* adapter.listEvents("primary", now, weekLater);

          strictEqual(events.length, 2);
          strictEqual(events[0]?.id, "event-1");
          strictEqual(events[0]?.summary, "Team Meeting");
          assertTrue(O.isSome(events[0]?.description ?? O.none()));
          strictEqual(O.getOrNull(events[0]?.description ?? O.none()), "Weekly sync");
          strictEqual(events[1]?.id, "event-2");
          strictEqual(events[1]?.summary, "Standup");
        })
      );

      it.effect("extracts attendee emails correctly", () =>
        Effect.gen(function* () {
          const adapter = yield* GoogleCalendarAdapter;
          const now = DateTime.unsafeNow();
          const weekLater = DateTime.add(now, { days: 7 });

          const events = yield* adapter.listEvents("primary", now, weekLater);

          strictEqual(events[0]?.attendees.length, 1);
          strictEqual(events[0]?.attendees[0], "user@example.com");
          strictEqual(events[1]?.attendees.length, 0);
        })
      );
    });

    const MockHttpClient404 = makeHttpClientMock((_request) =>
      Effect.succeed({ status: 404, body: { error: { message: "Calendar not found" } } })
    );

    const TestLayerWithError = GoogleCalendarAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClient),
      Layer.provide(MockHttpClient404)
    );

    layer(TestLayerWithError, { timeout: Duration.seconds(30) })("listEvents error handling", (it) => {
      it.effect("returns GoogleApiError for HTTP 404", () =>
        Effect.gen(function* () {
          const adapter = yield* GoogleCalendarAdapter;
          const now = DateTime.unsafeNow();
          const weekLater = DateTime.add(now, { days: 7 });

          const error = yield* Effect.flip(adapter.listEvents("nonexistent", now, weekLater));

          assertTrue(error instanceof GoogleApiError);
          strictEqual(error.statusCode, 404);
        })
      );
    });
  });

  describe("createEvent", () => {
    const mockCreateEventResponse = {
      id: "new-event-123",
      summary: "New Meeting",
      description: "Created via API",
      start: {
        dateTime: "2024-01-20T09:00:00Z",
        timeZone: "UTC",
      },
      end: {
        dateTime: "2024-01-20T10:00:00Z",
        timeZone: "UTC",
      },
      attendees: [{ email: "invitee@example.com" }],
      htmlLink: "https://calendar.google.com/event/new-event-123",
    };

    const MockHttpClient = makeHttpClientMock((request) => {
      const url = request.url;
      if (url.includes("/calendars/primary/events") && request.method === "POST") {
        return Effect.succeed({ status: 200, body: mockCreateEventResponse });
      }
      return Effect.succeed({ status: 404, body: { error: "Not found" } });
    });

    const TestLayer = GoogleCalendarAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClient),
      Layer.provide(MockHttpClient)
    );

    layer(TestLayer, { timeout: Duration.seconds(30) })("createEvent tests", (it) => {
      it.effect("creates event and returns response", () =>
        Effect.gen(function* () {
          const adapter = yield* GoogleCalendarAdapter;
          const startTime = DateTime.unsafeMake(Date.parse("2024-01-20T09:00:00Z"));
          const endTime = DateTime.unsafeMake(Date.parse("2024-01-20T10:00:00Z"));

          const input: CreateEventInput = {
            summary: "New Meeting",
            description: "Created via API",
            startTime,
            endTime,
            attendees: ["invitee@example.com"],
          };

          const event = yield* adapter.createEvent("primary", input);

          strictEqual(event.id, "new-event-123");
          strictEqual(event.summary, "New Meeting");
          assertTrue(O.isSome(event.description));
          strictEqual(O.getOrNull(event.description), "Created via API");
          strictEqual(event.attendees.length, 1);
        })
      );
    });
  });

  describe("updateEvent", () => {
    const mockUpdateEventResponse = {
      id: "event-1",
      summary: "Updated Meeting Title",
      description: "Updated description",
      start: {
        dateTime: "2024-01-15T10:00:00Z",
        timeZone: "UTC",
      },
      end: {
        dateTime: "2024-01-15T11:00:00Z",
        timeZone: "UTC",
      },
    };

    const MockHttpClient = makeHttpClientMock((request) => {
      const url = request.url;
      if (url.includes("/calendars/primary/events/event-1") && request.method === "PATCH") {
        return Effect.succeed({ status: 200, body: mockUpdateEventResponse });
      }
      return Effect.succeed({ status: 404, body: { error: "Not found" } });
    });

    const TestLayer = GoogleCalendarAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClient),
      Layer.provide(MockHttpClient)
    );

    layer(TestLayer, { timeout: Duration.seconds(30) })("updateEvent tests", (it) => {
      it.effect("updates event and returns response", () =>
        Effect.gen(function* () {
          const adapter = yield* GoogleCalendarAdapter;

          const event = yield* adapter.updateEvent("primary", "event-1", {
            summary: "Updated Meeting Title",
            description: "Updated description",
          });

          strictEqual(event.id, "event-1");
          strictEqual(event.summary, "Updated Meeting Title");
          assertTrue(O.isSome(event.description));
          strictEqual(O.getOrNull(event.description), "Updated description");
        })
      );
    });
  });

  describe("deleteEvent", () => {
    const MockHttpClient = makeHttpClientMock((request) => {
      const url = request.url;
      if (url.includes("/calendars/primary/events/event-1") && request.method === "DELETE") {
        return Effect.succeed({ status: 204, body: {} });
      }
      if (url.includes("/calendars/primary/events/nonexistent") && request.method === "DELETE") {
        return Effect.succeed({ status: 404, body: { error: { message: "Event not found" } } });
      }
      return Effect.succeed({ status: 404, body: { error: "Not found" } });
    });

    const TestLayer = GoogleCalendarAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClient),
      Layer.provide(MockHttpClient)
    );

    layer(TestLayer, { timeout: Duration.seconds(30) })("deleteEvent tests", (it) => {
      it.effect("deletes event successfully", () =>
        Effect.gen(function* () {
          const adapter = yield* GoogleCalendarAdapter;
          yield* adapter.deleteEvent("primary", "event-1");
        })
      );

      it.effect("returns GoogleApiError for non-existent event", () =>
        Effect.gen(function* () {
          const adapter = yield* GoogleCalendarAdapter;
          const error = yield* Effect.flip(adapter.deleteEvent("primary", "nonexistent"));

          assertTrue(error instanceof GoogleApiError);
          strictEqual(error.statusCode, 404);
        })
      );
    });
  });

  describe("authentication errors", () => {
    const MockHttpClient = makeHttpClientMock((_request) =>
      Effect.succeed({ status: 200, body: { items: [] } })
    );

    const TestLayerMissingScopes = GoogleCalendarAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClientMissingScopes),
      Layer.provide(MockHttpClient)
    );

    layer(TestLayerMissingScopes, { timeout: Duration.seconds(30) })(
      "authentication error handling",
      (it) => {
        it.effect("returns GoogleScopeExpansionRequiredError when scopes are missing", () =>
          Effect.gen(function* () {
            const adapter = yield* GoogleCalendarAdapter;
            const now = DateTime.unsafeNow();
            const weekLater = DateTime.add(now, { days: 7 });

            const error = yield* Effect.flip(adapter.listEvents("primary", now, weekLater));

            assertTrue(error instanceof GoogleScopeExpansionRequiredError);
            assertTrue(error.missingScopes.length > 0);
          })
        );
      }
    );
  });

  describe("REQUIRED_SCOPES", () => {
    effect("contains calendar.events scope", () =>
      Effect.gen(function* () {
        assertTrue(REQUIRED_SCOPES.includes(CalendarScopes.events));
      })
    );
  });
});
