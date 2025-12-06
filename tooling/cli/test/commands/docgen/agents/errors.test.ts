/**
 * @file Unit tests for agent error classes.
 * @module docgen/agents/errors.test
 */

import {
  AgentApiError,
  type AgentError,
  AgentIterationLimitError,
  AgentOutputError,
  AgentToolError,
  AnalysisError,
} from "@beep/repo-cli/commands/docgen/agents/errors";
import { describe, effect, expect, it } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

describe("agent errors", () => {
  describe("AgentApiError", () => {
    it("creates with message only", () => {
      const error = new AgentApiError({ message: "Rate limit exceeded" });
      expect(error._tag).toBe("AgentApiError");
      expect(error.message).toBe("Rate limit exceeded");
      expect(error.cause).toBeUndefined();
    });

    it("creates with message and cause", () => {
      const cause = new Error("Network failure");
      const error = new AgentApiError({ message: "API call failed", cause });
      expect(error._tag).toBe("AgentApiError");
      expect(error.message).toBe("API call failed");
      expect(error.cause).toBe(cause);
    });

    effect("can be caught by tag in Effect", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(new AgentApiError({ message: "Test error" }));

        const result = yield* failing.pipe(
          Effect.catchTag("AgentApiError", (e) => Effect.succeed(`Caught: ${e.message}`))
        );

        expect(result).toBe("Caught: Test error");
      })
    );
  });

  describe("AgentToolError", () => {
    it("creates with toolName and message", () => {
      const error = new AgentToolError({
        toolName: "ReadSourceFile",
        message: "File not found",
      });
      expect(error._tag).toBe("AgentToolError");
      expect(error.toolName).toBe("ReadSourceFile");
      expect(error.message).toBe("File not found");
      expect(error.cause).toBeUndefined();
    });

    it("creates with toolName, message, and cause", () => {
      const cause = new Error("ENOENT");
      const error = new AgentToolError({
        toolName: "ReadSourceFile",
        message: "File not found",
        cause,
      });
      expect(error._tag).toBe("AgentToolError");
      expect(error.cause).toBe(cause);
    });

    // effect("can be matched by tag", () =>
    //   Effect.gen(function* () {
    //     const error: AgentError = new AgentToolError({
    //       toolName: "WriteSourceFile",
    //       message: "Permission denied",
    //     });
    //
    //     const result = Match.value(error).pipe(
    //       Match.tag("AgentApiError", () => "api"),
    //       Match.tag("AgentToolError", (e) => `tool: ${e.toolName}`),
    //       Match.tag("AgentOutputError", () => "output"),
    //       Match.tag("AgentIterationLimitError", () => "limit"),
    //       Match.exhaustive
    //     );
    //
    //     expect(result).toBe("tool: WriteSourceFile");
    //   })
    // );

    effect("can be caught by tag in Effect", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(
          new AgentToolError({
            toolName: "TestTool",
            message: "Test failure",
          })
        );

        const result = yield* failing.pipe(
          Effect.catchTag("AgentToolError", (e) => Effect.succeed(`Caught: ${e.toolName}`))
        );

        expect(result).toBe("Caught: TestTool");
      })
    );
  });

  describe("AgentOutputError", () => {
    it("creates with message and output", () => {
      const malformedOutput = { unexpected: "structure" };
      const error = new AgentOutputError({
        message: "Expected JSON array",
        output: malformedOutput,
      });

      expect(error._tag).toBe("AgentOutputError");
      expect(error.message).toBe("Expected JSON array");
      expect(error.output).toEqual(malformedOutput);
    });

    it("preserves string output", () => {
      const error = new AgentOutputError({
        message: "Invalid format",
        output: "This is not JSON",
      });

      expect(error.output).toBe("This is not JSON");
    });

    it("preserves null output", () => {
      const error = new AgentOutputError({
        message: "Null response",
        output: null,
      });

      expect(error.output).toBeNull();
    });

    effect("can be caught by tag in Effect", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(
          new AgentOutputError({
            message: "Parse error",
            output: "invalid",
          })
        );

        const result = yield* failing.pipe(
          Effect.catchTag("AgentOutputError", (e) => Effect.succeed(`Caught: ${e.message}`))
        );

        expect(result).toBe("Caught: Parse error");
      })
    );
  });

  describe("AgentIterationLimitError", () => {
    it("creates with packageName and iteration counts", () => {
      const error = new AgentIterationLimitError({
        packageName: "@beep/schema",
        iterations: 20,
        maxIterations: 20,
      });

      expect(error._tag).toBe("AgentIterationLimitError");
      expect(error.packageName).toBe("@beep/schema");
      expect(error.iterations).toBe(20);
      expect(error.maxIterations).toBe(20);
    });

    it("can represent partial progress", () => {
      const error = new AgentIterationLimitError({
        packageName: "@beep/utils",
        iterations: 15,
        maxIterations: 20,
      });

      expect(error.iterations).toBe(15);
      expect(error.maxIterations).toBe(20);
    });

    effect("can be caught by tag in Effect", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(
          new AgentIterationLimitError({
            packageName: "@beep/test",
            iterations: 10,
            maxIterations: 10,
          })
        );

        const result = yield* failing.pipe(
          Effect.catchTag("AgentIterationLimitError", (e) => Effect.succeed(`Caught: ${e.packageName}`))
        );

        expect(result).toBe("Caught: @beep/test");
      })
    );
  });

  describe("AnalysisError", () => {
    it("creates with path and message", () => {
      const error = new AnalysisError({
        path: "/path/to/package",
        message: "AST parsing failed",
      });

      expect(error._tag).toBe("AnalysisError");
      expect(error.path).toBe("/path/to/package");
      expect(error.message).toBe("AST parsing failed");
    });

    effect("can be caught by tag in Effect", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(new AnalysisError({ path: "/test", message: "Test failure" }));

        const result = yield* failing.pipe(
          Effect.catchTag("AnalysisError", (e) => Effect.succeed(`Caught: ${e.path}`))
        );

        expect(result).toBe("Caught: /test");
      })
    );
  });

  describe("AgentError union type", () => {
    it("can exhaustively match all error types", () => {
      const errors: ReadonlyArray<AgentError> = [
        new AgentApiError({ message: "api error" }),
        new AgentToolError({ toolName: "Tool", message: "tool error" }),
        new AgentOutputError({ message: "output error", output: {} }),
        new AgentIterationLimitError({ packageName: "@test", iterations: 5, maxIterations: 10 }),
      ];

      const tags = errors.map((error) =>
        Match.value(error).pipe(
          Match.tag("AgentApiError", () => "api"),
          Match.tag("AgentToolError", () => "tool"),
          Match.tag("AgentOutputError", () => "output"),
          Match.tag("AgentIterationLimitError", () => "iteration"),
          Match.exhaustive
        )
      );

      expect(tags[0]).toBe("api");
      expect(tags[1]).toBe("tool");
      expect(tags[2]).toBe("output");
      expect(tags[3]).toBe("iteration");
    });
  });
});
