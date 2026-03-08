import { describe, expect, it } from "@effect/vitest";
import { Project } from "ts-morph";
import { readSignature } from "../src/TSMorph/TSMorph.shared.js";

describe("TSMorph.shared", () => {
  describe("readSignature", () => {
    it("strips multiline decorator spans before reading the declaration signature", () => {
      const project = new Project({
        compilerOptions: {
          experimentalDecorators: true,
        },
        useInMemoryFileSystem: true,
      });
      const sourceFile = project.createSourceFile(
        "decorated.ts",
        `@trace()
@config({
  nested: {
    enabled: true,
  },
})
export class DecoratedThing {}`
      );
      const declaration = sourceFile.getClassOrThrow("DecoratedThing");

      expect(readSignature(declaration)).toBe("export class DecoratedThing {}");
    });
  });
});
