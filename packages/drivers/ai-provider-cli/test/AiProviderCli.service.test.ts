import { AiProviderCli, AiProviderCliProcessResult } from "@beep/ai-provider-cli";
import { describe, expect, layer } from "@effect/vitest";
import { Effect } from "effect";
import * as A from "effect/Array";
import type { AiProviderCliProvider } from "@beep/ai-provider-cli";

const runner = (provider: AiProviderCliProvider, _command: string, args: ReadonlyArray<string>) =>
  Effect.succeed(
    AiProviderCliProcessResult.make({
      exitCode: provider === "claude" ? 0 : 1,
      stderr: provider === "claude" ? "" : "not logged in",
      stdout: A.join(args, " "),
    })
  );

describe("@beep/ai-provider-cli", () => {
  layer(AiProviderCli.makeLayerFromRunner(runner))((it) => {
    it.effect(
      "maps Claude and Codex CLI exit codes to sanitized auth probes",
      Effect.fnUntraced(function* () {
        const providerCli = yield* AiProviderCli;

        const claude = yield* providerCli.checkAuth("claude");
        const codex = yield* providerCli.checkAuth("codex");

        expect(claude.command).toBe("claude");
        expect(claude.status).toBe("authenticated");
        expect(codex.command).toBe("codex");
        expect(codex.status).toBe("not-authenticated");
      })
    );
  });
});
