import { Effect, Schema } from "effect";
import { Tool, Toolkit } from "effect/unstable/ai";

/**
 * Calculator Tool - Safely evaluates mathematical expressions
 */
const calculatorTool = Tool.make("calculate", {
  description:
    "Evaluate a mathematical expression safely. Supports basic arithmetic operations (+, -, *, /), exponentiation (^), and common functions (sin, cos, sqrt, etc). Example: calculate(expression: '2 + 2 * 10')",
  parameters: Schema.Struct({
    expression: Schema.String,
  }),
  success: Schema.String,
});

/**
 * Echo Tool - Simple echo for testing
 */
const echoTool = Tool.make("echo", {
  description:
    "Echo back a message. Useful for testing tool calling. Example: echo(message: 'Hello, World!')",
  parameters: Schema.Struct({
    message: Schema.String,
  }),
  success: Schema.String,
});

/**
 * Get Current Time Tool - Returns current UTC time
 */
const getCurrentTimeTool = Tool.make("getCurrentTime", {
  description:
    "Get the current date and time in a given timezone. Example: getCurrentTime(timezone: 'UTC')",
  parameters: Tool.EmptyParams,
  success: Schema.String,
});

export const SampleToolkit = Toolkit.make(
  calculatorTool,
  echoTool,
  getCurrentTimeTool,
);

export const SampleToolkitLive = SampleToolkit.toLayer(
  Effect.gen(function* () {
    return {
      calculate: (params) =>
        Effect.gen(function* () {
          yield* Effect.log(`Calculating: ${params.expression}`);

          // Simple safe evaluation for basic math
          // Whitelist allowed characters
          const sanitized = params.expression.replace(/[^0-9+\-*/().\s]/g, "");

          if (sanitized !== params.expression) {
            return yield* Effect.succeed(
              `Error: Expression contains invalid characters. Only numbers and basic operators (+, -, *, /, parentheses) are allowed.`,
            );
          }

          return yield* Effect.try({
            try: () => {
              const value = Function(`"use strict"; return (${sanitized})`)();
              if (typeof value !== "number" || Number.isNaN(value)) {
                throw new Error("Result is not a valid number");
              }
              return `${params.expression} = ${value}`;
            },
            catch: (error) =>
              new Error(
                `Invalid expression: ${error instanceof Error ? error.message : String(error)}`,
              ),
          }).pipe(
            Effect.catch((error) => Effect.succeed(`Error: ${error.message}`)),
          );
        }),

      echo: (params) =>
        Effect.gen(function* () {
          yield* Effect.log(`Echo: ${params.message}`);
          return yield* Effect.succeed(`Echo: ${params.message}`);
        }),

      getCurrentTime: () =>
        Effect.gen(function* () {
          const now = new Date();
          const timeString = now.toLocaleString("en-US", {
            timeZone: "UTC",
          });
          yield* Effect.log(`Current time (UTC): ${timeString}`);
          return yield* Effect.succeed(
            `Current time in UTC: ${timeString} (ISO: ${now.toISOString()})`,
          );
        }),
    };
  }),
);
