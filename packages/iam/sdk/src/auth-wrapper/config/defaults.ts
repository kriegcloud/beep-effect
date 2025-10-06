import type { HandlerOptionsShape } from "./handler-options.schema";
import { mergeHandlerOptions } from "./merge-handler-options";

/**
 * Conservative defaults that individual handlers can merge with their local overrides.
 */
export const defaultHandlerOptions: HandlerOptionsShape = {
  tracing: "traced",
};

export const mergeWithDefaultHandlerOptions = (
  ...overrides: ReadonlyArray<HandlerOptionsShape | undefined>
): HandlerOptionsShape => mergeHandlerOptions(defaultHandlerOptions, ...overrides);
