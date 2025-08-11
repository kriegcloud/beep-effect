import fs from "node:fs";
import path from "node:path";
import { PackageJson } from "@beep/tooling-utils";
import { describe, it } from "@effect/vitest";
import { deepStrictEqual, throws } from "@effect/vitest/utils";
import * as S from "effect/Schema";

describe("PackageJson", () => {
  it("accepts minimal with required name", () => {
    const decode = S.decodeUnknownSync(PackageJson);
    const got = decode({ name: "pkg" });
    deepStrictEqual(got.name, "pkg");
  });

  it("rejects when name is missing or empty", () => {
    const decode = S.decodeUnknownSync(PackageJson);
    throws(() => decode({} as any));
    throws(() => decode({ name: "" } as any));
  });

  it("accepts typical fields and variants", () => {
    const decode = S.decodeUnknownSync(PackageJson);
    const input = {
      name: "pkg",
      license: "MIT",
      bin: { cli: "bin/cli.js" },
      repository: {
        type: "git",
        url: "https://example.com/repo.git",
        directory: ".",
      },
      bugs: "https://example.com/issues",
      funding: [
        "https://example.com/sponsor",
        { url: "https://example.com/fund", type: "patreon" },
      ],
      workspaces: ["packages/*"],
      author: { name: "Alice" },
      contributors: [
        "Bob <bob@example.com>",
        { name: "Carol", email: "c@example.com" },
      ],
      dependencies: { a: "^1.0.0" },
      devDependencies: { b: "^2.0.0" },
      bundleDependencies: ["a"],
      private: true,
      engines: { node: ">=18" },
      custom: { nested: [1, "x", null] },
    };
    const got = decode(input);
    deepStrictEqual(got.name, "pkg");
    deepStrictEqual(typeof got.repository, "object");
    deepStrictEqual(
      Array.isArray(got.workspaces) ||
        typeof got.workspaces === "object" ||
        got.workspaces === undefined,
      true,
    );
  });

  it("decodes the repo's root package.json", () => {
    const raw = fs.readFileSync(
      path.resolve(process.cwd(), "../../package.json"),
      "utf8",
    );
    const json = JSON.parse(raw);
    const decode = S.decodeUnknownSync(PackageJson);
    const got = decode(json);
    deepStrictEqual(typeof got.name, "string");
  });

  it("decodes this package's package.json", () => {
    const raw = fs.readFileSync(
      path.resolve(process.cwd(), "package.json"),
      "utf8",
    );
    const json = JSON.parse(raw);
    const decode = S.decodeUnknownSync(PackageJson);
    const got = decode(json);
    deepStrictEqual(got.name, "@beep/tooling-utils");
  });
});
