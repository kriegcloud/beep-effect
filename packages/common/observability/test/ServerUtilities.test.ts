import { describe, expect, it } from "vitest";
import { sanitizePrometheusMetrics } from "../src/server/index.ts";

describe("ServerUtilities", () => {
  it("removes duplicate Infinity histogram buckets from Prometheus output", () => {
    const input = ['demo_bucket{le="10"} 1', 'demo_bucket{le="Infinity"} 1', 'demo_bucket{le="+Inf"} 1'].join("\n");

    const sanitized = sanitizePrometheusMetrics(input);

    expect(sanitized).not.toContain('le="Infinity"');
    expect(sanitized).toContain('le="+Inf"');
  });
});
