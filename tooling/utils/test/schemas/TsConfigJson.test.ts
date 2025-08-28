import fs from "node:fs";
import path from "node:path";
import { ExtendsDefinition, TsConfigJson } from "@beep/tooling-utils";
import { describe, it } from "@effect/vitest";
import { deepStrictEqual, throws } from "@effect/vitest/utils";
import * as S from "effect/Schema";

describe("TsConfigJson", () => {
  it("accepts minimal config when one of files/include/exclude/references is present", () => {
    const decode = S.decodeUnknownSync(TsConfigJson);
    const got = decode({ compilerOptions: {}, include: ["src"] });
    deepStrictEqual(got.include, ["src"]);
  });

  it("rejects when none of files/include/exclude/references is present", () => {
    const decode = S.decodeUnknownSync(TsConfigJson);
    throws(() => decode({ compilerOptions: {} }));
  });

  describe("extends", () => {
    it("accepts string", () => {
      const decode = S.decodeUnknownSync(ExtendsDefinition);
      const got = decode({ extends: "./base.json" });
      deepStrictEqual(got.extends, "./base.json");
    });
    it("accepts string[]", () => {
      const decode = S.decodeUnknownSync(ExtendsDefinition);
      const list = ["@tsconfig/node18/tsconfig.json", "./base.json"];
      const got = decode({ extends: list });
      deepStrictEqual(got.extends, list);
    });
  });

  it("enforces unique lib entries", () => {
    const decode = S.decodeUnknownSync(TsConfigJson);
    throws(() => decode({ compilerOptions: { lib: ["ES2015", "ES2015"] }, include: [] }));
  });

  it("enforces unique files entries", () => {
    const decode = S.decodeUnknownSync(TsConfigJson);
    throws(() => decode({ files: ["a.ts", "a.ts"] }));
  });

  it("enforces unique references", () => {
    const decode = S.decodeUnknownSync(TsConfigJson);
    throws(() => decode({ references: [{ path: "./a" }, { path: "./a" }] }));
  });

  it("rejects invalid jsx value", () => {
    const decode = S.decodeUnknownSync(TsConfigJson);
    throws(() => decode({ compilerOptions: { jsx: "react-jx" }, include: [] }));
  });

  it("accepts case-insensitive target enum (e.g. ESNEXT)", () => {
    const decode = S.decodeUnknownSync(TsConfigJson);
    const got = decode({ compilerOptions: { target: "ESNEXT" }, include: [] });
    deepStrictEqual(got.compilerOptions?.target?.toLowerCase?.(), "esnext");
  });

  it("decodes the repo's root tsconfig.json", () => {
    const raw = fs.readFileSync(path.resolve(process.cwd(), "../../tsconfig.json"), "utf8");
    const json = JSON.parse(raw);
    const decode = S.decodeUnknownSync(TsConfigJson);
    const got = decode(json);
    deepStrictEqual(Array.isArray(got.references), true);
  });

  it("decodes the repo's tsconfig.base.json", () => {
    const raw = fs.readFileSync(path.resolve(process.cwd(), "../../tsconfig.base.json"), "utf8");
    const json = JSON.parse(raw);
    const decode = S.decodeUnknownSync(TsConfigJson);
    const got = decode(json);
    deepStrictEqual(typeof got.compilerOptions, "object");
  });
});
