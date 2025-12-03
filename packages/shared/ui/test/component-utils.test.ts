import { generateMimeTypes } from "@beep/shared-ui/component-utils";
import { fillInputRouteConfig } from "@beep/shared-ui/utils";
import { describe, expect, it } from "@beep/testkit";
import * as E from "effect/Effect";

describe("generateMimeTypes", () => {
  it("dumps all mime-types out when there's a generic type", () => {
    const [imageMimes] = generateMimeTypes(["image"]);
    expect(imageMimes).toContain("image/*");
    expect(imageMimes).toContain("image/png");
    expect(imageMimes).toContain("image/jpeg");
    expect(imageMimes).toContain("image/gif");
    expect(imageMimes).toContain("image/webp");
  });

  it("generates an empty array when there's 'blob' in the list", () => {
    expect(generateMimeTypes(["blob"])).toEqual([]);
    expect(generateMimeTypes(["image", "blob"])).toEqual([]);
  });

  it("accepts a route config", () => {
    const config = E.runSync(
      fillInputRouteConfig({
        image: {},
        video: {},
      })
    );
    const [imageMimes, videoMimes] = generateMimeTypes(config);
    expect(imageMimes).toContain("image/*");
    expect(imageMimes).toContain("image/png");
    expect(imageMimes).toContain("image/jpeg");
    expect(imageMimes).toContain("image/gif");
    expect(imageMimes).toContain("image/webp");

    expect(videoMimes).toContain("video/*");
    expect(videoMimes).toContain("video/mp4");
    expect(videoMimes).toContain("video/webm");
  });
});
