# Phase 4 Output: Runtime Layer Wiring Verification

*Completed: 2026-02-04*

## Summary

Phase 4 successfully wired all Google Workspace adapters into the central runtime layer composition.

## Checklist

- [x] All existing functionality preserved
- [x] Imports updated
- [x] Layers wired correctly
- [x] Tests pass

## Files Created

### GoogleWorkspace.layer.ts

**Path**: `packages/runtime/server/src/GoogleWorkspace.layer.ts`

Composes all Google Workspace adapters:
- `CalendarAdapterLayer` - GoogleCalendarAdapterLive
- `GmailAdapterLayer` - GmailAdapterLive
- `GmailExtractionAdapterLayer` - GmailExtractionAdapterLive

Each adapter provided with:
- `GoogleAuthClientLive` (requires AuthContext)
- `FetchHttpClient.layer`

### Integration Test Files

| Package | Test File | Tests |
|---------|-----------|-------|
| `@beep/calendar-server` | `test/adapters/GoogleCalendarAdapter.test.ts` | 10 |
| `@beep/comms-server` | `test/adapters/GmailAdapter.test.ts` | 15 |
| `@beep/knowledge-server` | `test/adapters/GmailExtractionAdapter.test.ts` | 14 |

## Files Modified

| File | Change |
|------|--------|
| `packages/runtime/server/src/HttpRouter.layer.ts` | Added `GoogleWorkspace.layer` to `ProtectedRoutes` |
| `packages/runtime/server/src/index.ts` | Re-exports `GoogleWorkspace` |
| `packages/runtime/server/package.json` | Added google-workspace dependencies |
| `packages/runtime/server/tsconfig.src.json` | Added project reference |

## Layer Composition

```
HttpRouter.layer
  └── ProtectedRoutes
       ├── Rpc.layer
       └── GoogleWorkspace.layer (requires AuthContext)
            ├── CalendarAdapterLayer
            │    └── GoogleCalendarAdapterLive
            │         ├── GoogleAuthLayer
            │         └── FetchHttpClient.layer
            ├── GmailAdapterLayer
            │    └── GmailAdapterLive
            │         ├── GoogleAuthLayer
            │         └── FetchHttpClient.layer
            └── GmailExtractionAdapterLayer
                 └── GmailExtractionAdapterLive
                      ├── GoogleAuthLayer
                      └── FetchHttpClient.layer
```

## Verification Results

### Type Checks

```
✓ @beep/runtime-server - 0 errors
✓ @beep/calendar-server - 0 errors
✓ @beep/comms-server - 0 errors
✓ @beep/knowledge-server - 0 errors
```

### Tests

| Package | Pass | Fail | Total |
|---------|------|------|-------|
| `@beep/calendar-server` | 10 | 0 | 10 |
| `@beep/comms-server` | 15 | 0 | 15 |
| `@beep/knowledge-server` | 430 | 0 | 430 |

## Test Patterns Used

### Mock GoogleAuthClient

```typescript
const MockGoogleAuthClient = Layer.succeed(
  GoogleAuthClient,
  GoogleAuthClient.of({
    getValidToken: (_scopes) =>
      Effect.succeed(
        new GoogleOAuthToken({
          accessToken: O.some("mock-access-token"),
          refreshToken: O.none(),
          scope: O.some(scopes.join(" ")),
          tokenType: O.some("Bearer"),
          expiryDate: O.some(DateTime.add(DateTime.unsafeNow(), { hours: 1 })),
        })
      ),
    refreshToken: () =>
      Effect.fail(new GoogleAuthenticationError({ message: "Not supported" })),
  })
);
```

### Mock HttpClient

```typescript
const MockHttpClient = (responses: Record<string, object>) =>
  Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request) =>
      Effect.gen(function* () {
        const url = request.url;
        const responseBody = responses[url] ?? { error: "Not found" };
        return HttpClientResponse.fromWeb(
          request as unknown as HttpClientRequest.HttpClientRequest.NonParsed,
          new Response(JSON.stringify(responseBody), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      })
    )
  );
```

## Notes

- Adapters are now accessible in any protected route through the Effect context
- Error handling for `GoogleScopeExpansionRequiredError` tested
- All adapters share the same `GoogleAuthLayer` (single instance per request)
