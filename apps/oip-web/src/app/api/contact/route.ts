/**
 * OIP contact intake route.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Effect } from "effect";
import { contactRequestResponse } from "./ContactRouteResponse";
import type { NextResponse } from "next/server";

/**
 * Handles OIP contact submissions at the Next.js route boundary.
 *
 * @example
 * ```ts
 * import { POST } from "@beep/oip-web/app/api/contact/route"
 *
 * const handler: (request: Request) => Promise<Response> = POST
 * console.log(typeof handler)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export function POST(request: Request): Promise<NextResponse> {
  return Effect.runPromise(contactRequestResponse(request));
}
