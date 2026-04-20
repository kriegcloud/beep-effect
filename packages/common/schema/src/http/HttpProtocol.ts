/**
 * Module for HTTP protocol ("http" or "https").
 *
 * @module \@beep/schema/http/Protocol
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import { LiteralKit } from "../LiteralKit.ts";

const $I = $SchemaId.create("http/HttpProtocol");

/**
 * An HTTP protocol ("http" or "https")
 *
 * @category Validation
 * @since 0.0.0
 */
export const HttpProtocol = LiteralKit(["http", "https"]).pipe(
  $I.annoteSchema("HttpProtocol", {
    description: 'An HTTP protocol ("http" or "https")',
  })
);

/**
 * {@inheritDoc HttpProtocol}
 *
 * @category Validation
 * @since 0.0.0
 */
export type HttpProtocol = typeof HttpProtocol.Type;
