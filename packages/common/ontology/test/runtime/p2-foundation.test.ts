import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";
import { TimeDurationMapping } from "../../src/mapping/DurationMapping.js";
import { AttachmentMetadata } from "../../src/object/Attachment.js";
import { isError, isOk, Result } from "../../src/object/Result.js";
import { PropertyKnownTypeFormattingRule } from "../../src/ontology/valueFormatting/PropertyKnownTypeFormattingRule.js";
import { PropertyTypeReferenceOrStringConstant } from "../../src/ontology/valueFormatting/PropertyValueFormattingUtils.js";
import { PageResult } from "../../src/PageResult.js";
import { TimeseriesDurationMapping } from "../../src/timeseries/timeseries.js";

describe("p2 foundation runtime contracts", () => {
  it("decodes attachment metadata", () => {
    const decode = S.decodeUnknownSync(AttachmentMetadata);
    const decoded = decode({
      rid: "ri.attachment.main.1",
      filename: "image.png",
      sizeBytes: 2048,
      mediaType: "image/png",
    });

    expect(decoded.filename).toBe("image.png");
    expect(decoded.sizeBytes).toBe(2048);
  });

  it("decodes page results with optional next page token", () => {
    const decode = S.decodeUnknownSync(PageResult(S.String));
    const decoded = decode({
      data: ["row-1", "row-2"],
      totalCount: "2",
    });

    expect(decoded.data).toEqual(["row-1", "row-2"]);
    expect(decoded.nextPageToken).toBeUndefined();
  });

  it("supports property-api-name references in formatting utils", () => {
    const decode = S.decodeUnknownSync(PropertyTypeReferenceOrStringConstant);
    const decoded = decode({
      type: "propertyType",
      propertyApiName: "currencyCode",
    });

    expect(decoded.type).toBe("propertyType");
    if (decoded.type === "propertyType") {
      expect(decoded.propertyApiName).toBe("currencyCode");
      return;
    }
    throw new Error("Expected propertyType branch");
  });

  it("decodes known-type formatting rules", () => {
    const decode = S.decodeUnknownSync(PropertyKnownTypeFormattingRule);
    const decoded = decode({
      type: "knownType",
      knownType: "RESOURCE_RID",
    });

    expect(decoded.knownType).toBe("RESOURCE_RID");
  });

  it("applies result guards for ok and error branches", () => {
    const decode = S.decodeUnknownSync(Result(S.String));
    const ok = decode({ value: "done" });
    const error = decode({ error: new Error("failed") });

    expect(isOk(ok)).toBe(true);
    expect(isError(ok)).toBe(false);
    expect(isOk(error)).toBe(false);
    expect(isError(error)).toBe(true);
  });

  it("exposes duration mapping aliases for timeseries queries", () => {
    expect(TimeDurationMapping.hr).toBe("HOURS");
    expect(TimeseriesDurationMapping.ms).toBe("MILLISECONDS");
    expect(TimeseriesDurationMapping.week).toBe("WEEKS");
  });
});
