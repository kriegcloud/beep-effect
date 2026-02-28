import {
  decodeChangedPathsCsv,
  decodeSnapshotRecordJsonLine,
  encodeSnapshotRecordJsonLine,
  KgSchemaVersion,
  parseMcpPayload,
  parseMcpToolResult,
  SnapshotRecord,
} from "@beep/repo-utils";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";

describe("codegraph kg + graphiti helpers", () => {
  it("decodes changed csv with path normalization", async () => {
    const decoded = await Effect.runPromise(decodeChangedPathsCsv("./packages/a.ts, tooling\\b.ts , ,"));
    expect(decoded).toEqual(["packages/a.ts", "tooling/b.ts"]);
  });

  it("encodes and decodes snapshot json lines", async () => {
    const line = await Effect.runPromise(
      encodeSnapshotRecordJsonLine(
        new SnapshotRecord({
          schemaVersion: KgSchemaVersion,
          workspace: "beep-effect3",
          commitSha: "abc1234",
          file: "packages/a.ts",
          artifactHash: "hash-1",
          nodeCount: 1,
          edgeCount: 2,
          semanticEdgeCount: 0,
        })
      )
    );

    const decoded = await Effect.runPromise(decodeSnapshotRecordJsonLine(line));
    expect(decoded.file).toBe("packages/a.ts");
    expect(decoded.edgeCount).toBe(2);
  });

  it("parses MCP payload from sse body", () => {
    const payload = parseMcpPayload(
      'event: message\ndata: {"jsonrpc":"2.0","result":{"structuredContent":{"result":{"message":"ok"}}}}\n'
    );
    expect(payload._tag).toBe("Some");

    const parsed = parseMcpToolResult(
      200,
      'event: message\ndata: {"jsonrpc":"2.0","result":{"structuredContent":{"result":{"message":"ok"}}}}\n'
    );
    expect(parsed.isError).toBe(false);
    expect(parsed.message).toBe("ok");
  });
});
