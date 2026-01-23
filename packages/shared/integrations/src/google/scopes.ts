import { $SharedIntegrationsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { thunkFalse } from "@beep/utils";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SharedIntegrationsId.create("google/scopes");

/**
 * Google OAuth token structure
 */
export class GoogleOAuthToken extends S.Class<GoogleOAuthToken>($I`GoogleOAuthToken`)(
  {
    accessToken: S.optionalWith(S.String, {
      as: "Option",
    }).pipe(S.fromKey("access_token")),
    refreshToken: S.optionalWith(S.Redacted(S.String), {
      as: "Option",
    }).pipe(S.fromKey("refresh_token")),
    scope: S.optionalWith(S.String, {
      as: "Option",
    }),
    tokenType: S.optionalWith(S.String, {
      as: "Option",
    }).pipe(S.fromKey("token_type")),
    expiryDate: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, {
      as: "Option",
    }).pipe(S.fromKey("expiry_date")),
  },
  $I.annotations("GoogleOAuthToken", {
    description: "Google OAuth token structure",
  })
) {}

/**
 * Google OAuth scopes for Gmail and Calendar services
 */
export const GOOGLE_OAUTH_SCOPES = {
  GMAIL: {
    READONLY: "https://www.googleapis.com/auth/gmail.readonly",
    SEND: "https://www.googleapis.com/auth/gmail.send",
    MODIFY: "https://www.googleapis.com/auth/gmail.modify",
    LABELS: "https://www.googleapis.com/auth/gmail.labels",
    COMPOSE: "https://www.googleapis.com/auth/gmail.compose",
  },
  CALENDAR: {
    CALENDAR: "https://www.googleapis.com/auth/calendar",
    EVENTS: "https://www.googleapis.com/auth/calendar.events",
  },
} as const;

/**
 * All Google OAuth scopes used by todox (Gmail + Calendar)
 */
export const ALL_GOOGLE_SCOPES = [
  GOOGLE_OAUTH_SCOPES.GMAIL.READONLY,
  GOOGLE_OAUTH_SCOPES.GMAIL.SEND,
  GOOGLE_OAUTH_SCOPES.GMAIL.MODIFY,
  GOOGLE_OAUTH_SCOPES.GMAIL.LABELS,
  GOOGLE_OAUTH_SCOPES.GMAIL.COMPOSE,
  GOOGLE_OAUTH_SCOPES.CALENDAR.CALENDAR,
  GOOGLE_OAUTH_SCOPES.CALENDAR.EVENTS,
] as const;

/**
 * Gmail-specific required scopes
 */
export const GMAIL_REQUIRED_SCOPES = [
  GOOGLE_OAUTH_SCOPES.GMAIL.READONLY,
  GOOGLE_OAUTH_SCOPES.GMAIL.SEND,
  GOOGLE_OAUTH_SCOPES.GMAIL.MODIFY,
] as const;

/**
 * Calendar-specific required scopes
 */
export const CALENDAR_REQUIRED_SCOPES = [
  GOOGLE_OAUTH_SCOPES.CALENDAR.CALENDAR,
  GOOGLE_OAUTH_SCOPES.CALENDAR.EVENTS,
] as const;

/**
 * Check if a token has the required scopes
 */
export const hasRequiredScopes = (token: GoogleOAuthToken, requiredScopes: readonly string[]) =>
  F.pipe(
    token.scope,
    O.flatMap(
      O.liftPredicate((scope) => A.every(requiredScopes, (requiredScope) => Str.includes(requiredScope)(scope)))
    ),
    O.isSome
  );

export function hasAnyRequiredScope(token: GoogleOAuthToken, requiredScopes: readonly string[]): boolean {
  return F.pipe(
    token.scope,
    O.map(Str.split(" ")),
    O.map((tokenScopes) => A.some(requiredScopes, (requiredScope) => A.contains(tokenScopes, requiredScope))),
    O.getOrElse(thunkFalse)
  );
}
