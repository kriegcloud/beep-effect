/**
 * LLM-readable OPIP site summary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { getOpipSiteContent, makeLlmsText } from "../../content";

/**
 * Returns `llms.txt` for opip.law.
 *
 * @example
 * ```ts
 * import { GET } from "@beep/opip-web/app/llms.txt/route"
 *
 * const response = await GET()
 * console.log(response.headers.get("content-type"))
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export async function GET() {
  const content = await getOpipSiteContent();

  return new Response(makeLlmsText(content), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
