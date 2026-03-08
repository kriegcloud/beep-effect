import { Effect } from "effect"
import { canonicalizeJson } from "../json/CanonicalJson.js"
import { safeJsonStringify } from "../json/JsonCodec.js"

export const canonicalJsonStringify = (value: unknown): string =>
  safeJsonStringify(canonicalizeJson(value))

export const makeCheckpointPayloadHash = (
  action: string,
  payload: unknown
): Effect.Effect<string> => {
  const canonicalPayload = canonicalJsonStringify(payload)
  return Effect.promise(() =>
    crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${action}:${canonicalPayload}`)
    )
  ).pipe(
    Effect.map((buffer) =>
      Array.from(
        new Uint8Array(buffer),
        (byte) => byte.toString(16).padStart(2, "0")
      ).join("")
    )
  )
}
