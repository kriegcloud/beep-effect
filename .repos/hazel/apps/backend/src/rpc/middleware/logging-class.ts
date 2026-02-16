/**
 * Logging Middleware Class Definition (Client-Safe)
 *
 * This file contains ONLY the middleware class definition that is safe to import
 * in browser code. The server-side implementation is in logging.ts.
 */

import { RpcMiddleware } from "@effect/rpc"

/**
 * Logging middleware that logs all incoming RPC requests and their results.
 *
 * This middleware:
 * 1. Logs the RPC method name when a request is received
 * 2. Executes the handler
 * 3. Logs the result (success or failure) with annotations
 *
 * This provides the same logging behavior as HttpMiddleware.logger for HTTP API requests.
 *
 * Usage in RPC group:
 * ```typescript
 * const MyRpcs = RpcGroup.make(
 *   Rpc.make("MyMethod", { ... })
 * ).middleware(RpcLoggingMiddleware)
 * ```
 */
export class RpcLoggingMiddleware extends RpcMiddleware.Tag<RpcLoggingMiddleware>()("RpcLoggingMiddleware", {
	wrap: true,
}) {}
