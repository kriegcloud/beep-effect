import { makeAIMetricsStackArgs, makeAIMetricsStackArgsFromConfigValues } from "@beep/infra";
import { AiMetricsDeployTarget, AiMetricsInstallInput, makeAiMetricsInstallSpec } from "@beep/repo-ai-metrics";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";

describe("@beep/infra AIMetrics", () => {
  it("keeps stack args import-safe and target-aware", () => {
    const args = makeAIMetricsStackArgs(
      new AiMetricsInstallInput({
        hashSaltSecretRef: "op://beep-effect/ai-metrics/hash-salt",
        rawArchiveKeySecretRef: "op://beep-effect/ai-metrics/raw-archive-key",
        target: AiMetricsDeployTarget.Enum.dankserver,
      })
    );

    expect(args.install.target).toBe("dankserver");
    expect(args.install.dataRoot).toBeUndefined();
    expect(Effect.runSync(makeAiMetricsInstallSpec(args.install)).hashSaltSecretRef).toBe(
      "op://beep-effect/ai-metrics/hash-salt"
    );
    expect(Effect.runSync(makeAiMetricsInstallSpec(args.install)).rawArchiveKeySecretRef).toBe(
      "op://beep-effect/ai-metrics/raw-archive-key"
    );
  });

  it("maps the dankserver Pulumi stack config to a production-safe install spec", () => {
    const args = makeAIMetricsStackArgsFromConfigValues({
      hashSaltSecretRef: "op://beep-effect/ai-metrics/hash-salt",
      rawArchiveKeySecretRef: "op://beep-effect/ai-metrics/raw-archive-key",
      target: "dankserver",
    });
    const spec = Effect.runSync(makeAiMetricsInstallSpec(args.install));

    expect(args.install.target).toBe("dankserver");
    expect(spec.target).toBe("dankserver");
    expect(spec.hashSaltSecretRef).toBe("op://beep-effect/ai-metrics/hash-salt");
    expect(spec.rawArchiveKeySecretRef).toBe("op://beep-effect/ai-metrics/raw-archive-key");
  });

  it("rejects dankserver install specs when the hash salt secret reference is absent", () => {
    const args = makeAIMetricsStackArgsFromConfigValues({ target: "dankserver" });

    expect(() => Effect.runSync(makeAiMetricsInstallSpec(args.install))).toThrow(
      "non-local installs require hashSaltSecretRef"
    );
  });
});
