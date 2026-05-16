import { sanitizePrometheusMetrics } from "@beep/observability/server";
import { A } from "@beep/utils";
import { describe, expect, it } from "vitest";

describe("ServerUtilities", () => {
  it("removes duplicate Infinity histogram buckets from Prometheus output", () => {
    const input = A.join(['demo_bucket{le="10"} 1', 'demo_bucket{le="Infinity"} 1', 'demo_bucket{le="+Inf"} 1'], "\n");

    const sanitized = sanitizePrometheusMetrics(input);

    expect(sanitized).not.toContain('le="Infinity"');
    expect(sanitized).toContain('le="+Inf"');
  });
});
