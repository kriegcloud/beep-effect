import { pipe } from "effect";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as P from "effect/Predicate";
import type { ResponseHeader } from "./types.js";
export type ForceHTTPSRedirectOption =
  | boolean
  | [true, Partial<{ readonly maxAge: number; readonly includeSubDomains: boolean; readonly preload: boolean }>];
export class HttpsRedirectError extends Data.TaggedError("HttpsRedirectError")<{ readonly message: string }> {
  constructor(message: string) {
    super({ message });
  }
}
const headerName = "Strict-Transport-Security";
const defaultMaxAge = 60 * 60 * 24 * 365 * 2; // 2 years

export const createHSTSHeaderValue = (option?: ForceHTTPSRedirectOption): string | undefined => {
  if (option == undefined) return `max-age=${defaultMaxAge}`;
  if (option === false) return;
  if (option === true) return `max-age=${defaultMaxAge}`;

  if (A.isArray(option)) {
    if (option[0] !== true)
      throw new HttpsRedirectError(`Invalid value for ${headerName} in the first option: ${option[0]}`);

    const maxAge = option[1].maxAge ?? defaultMaxAge;
    if (P.not(P.isNumber)(maxAge) || !Number.isFinite(maxAge)) {
      throw new HttpsRedirectError(`Invalid value for "maxAge" option in ${headerName}: ${maxAge}`);
    }
    const { includeSubDomains, preload } = option[1];

    return pipe(
      A.make(`max-age=${maxAge}`, includeSubDomains ? "includeSubDomains" : undefined, preload ? "preload" : undefined),
      A.filter(P.isNotNullable),
      A.join("; ")
    );
  }

  throw new HttpsRedirectError(`Invaild value for ${headerName}: ${option}`);
};

export const createForceHTTPSRedirectHeader = (
  option?: undefined | ForceHTTPSRedirectOption,
  headerValueCreator = createHSTSHeaderValue
): ResponseHeader => {
  const value = headerValueCreator(option);

  return { name: headerName, value } as const;
};
