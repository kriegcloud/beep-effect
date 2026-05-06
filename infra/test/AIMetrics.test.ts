import { makeAIMetricsStackArgs } from "@beep/infra";
import { AiMetricsDeployTarget, AiMetricsInstallInput } from "@beep/repo-ai-metrics";
import { describe, expect, it } from "vitest";

describe("@beep/infra AIMetrics", () => {
  it("keeps stack args import-safe and target-aware", () => {
    const args = makeAIMetricsStackArgs(
      new AiMetricsInstallInput({
        target: AiMetricsDeployTarget.Enum.dankserver,
      })
    );

    expect(args.install.target).toBe("dankserver");
    expect(args.install.dataRoot).toBeUndefined();
  });
});
