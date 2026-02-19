import { describe, expect, it } from "@effect/vitest"
import { Exit, Schema } from "effect"
import {
  PackageJson,
  decodePackageJson,
  decodePackageJsonExit,
} from "../../src/schemas/PackageJson.js"

describe("PackageJson schema", () => {
  describe("valid structures", () => {
    it("decodes minimal package.json (name only)", () => {
      const input = { name: "my-package" }
      const result = decodePackageJson(input)
      expect(result.name).toBe("my-package")
    })

    it("decodes a full package.json with all common fields", () => {
      const input = {
        name: "@beep/repo-utils",
        version: "1.0.0",
        description: "Monorepo utilities",
        keywords: ["monorepo", "effect"],
        license: "MIT",
        private: true,
        type: "module",
        main: "dist/index.js",
        module: "dist/index.mjs",
        types: "dist/index.d.ts",
        scripts: {
          build: "tsc -b",
          test: "vitest",
        },
        dependencies: {
          effect: "^4.0.0",
        },
        devDependencies: {
          "@types/node": "^20.0.0",
        },
        peerDependencies: {
          typescript: "^5.0.0",
        },
        optionalDependencies: {
          fsevents: "^2.3.0",
        },
        files: ["dist", "src"],
        engines: { node: ">=20" },
        workspaces: ["packages/*", "tooling/*"],
        homepage: "https://github.com/example/repo",
      }
      const result = decodePackageJson(input)
      expect(result.name).toBe("@beep/repo-utils")
      expect(result.version).toBe("1.0.0")
      expect(result.description).toBe("Monorepo utilities")
      expect(result.keywords).toEqual(["monorepo", "effect"])
      expect(result.license).toBe("MIT")
      expect(result.private).toBe(true)
      expect(result.scripts).toEqual({ build: "tsc -b", test: "vitest" })
      expect(result.dependencies).toEqual({ effect: "^4.0.0" })
      expect(result.devDependencies).toEqual({ "@types/node": "^20.0.0" })
      expect(result.peerDependencies).toEqual({ typescript: "^5.0.0" })
      expect(result.optionalDependencies).toEqual({ fsevents: "^2.3.0" })
      expect(result.files).toEqual(["dist", "src"])
      expect(result.engines).toEqual({ node: ">=20" })
      expect(result.workspaces).toEqual(["packages/*", "tooling/*"])
      expect(result.homepage).toBe("https://github.com/example/repo")
    })

    it("decodes author as a string", () => {
      const input = { name: "pkg", author: "John Doe <john@example.com>" }
      const result = decodePackageJson(input)
      expect(result.author).toBe("John Doe <john@example.com>")
    })

    it("decodes author as an object", () => {
      const input = {
        name: "pkg",
        author: { name: "John Doe", email: "john@example.com", url: "https://example.com" },
      }
      const result = decodePackageJson(input)
      expect(result.author).toEqual({ name: "John Doe", email: "john@example.com", url: "https://example.com" })
    })

    it("decodes author object with only name", () => {
      const input = { name: "pkg", author: { name: "Jane" } }
      const result = decodePackageJson(input)
      expect(result.author).toEqual({ name: "Jane" })
    })

    it("decodes repository as a string", () => {
      const input = { name: "pkg", repository: "github:user/repo" }
      const result = decodePackageJson(input)
      expect(result.repository).toBe("github:user/repo")
    })

    it("decodes repository as an object", () => {
      const input = {
        name: "pkg",
        repository: { type: "git", url: "git@github.com:user/repo.git", directory: "packages/foo" },
      }
      const result = decodePackageJson(input)
      expect(result.repository).toEqual({ type: "git", url: "git@github.com:user/repo.git", directory: "packages/foo" })
    })

    it("decodes bugs as a string", () => {
      const input = { name: "pkg", bugs: "https://github.com/user/repo/issues" }
      const result = decodePackageJson(input)
      expect(result.bugs).toBe("https://github.com/user/repo/issues")
    })

    it("decodes bugs as an object", () => {
      const input = {
        name: "pkg",
        bugs: { url: "https://github.com/user/repo/issues", email: "bugs@example.com" },
      }
      const result = decodePackageJson(input)
      expect(result.bugs).toEqual({ url: "https://github.com/user/repo/issues", email: "bugs@example.com" })
    })

    it("decodes bin as a string", () => {
      const input = { name: "pkg", bin: "./bin/cli.js" }
      const result = decodePackageJson(input)
      expect(result.bin).toBe("./bin/cli.js")
    })

    it("decodes bin as a record", () => {
      const input = { name: "pkg", bin: { cli: "./bin/cli.js", serve: "./bin/serve.js" } }
      const result = decodePackageJson(input)
      expect(result.bin).toEqual({ cli: "./bin/cli.js", serve: "./bin/serve.js" })
    })

    it("decodes exports as an unknown value", () => {
      const input = {
        name: "pkg",
        exports: {
          ".": { import: "./dist/index.mjs", require: "./dist/index.cjs" },
          "./utils": "./dist/utils.js",
        },
      }
      const result = decodePackageJson(input)
      expect(result.exports).toEqual({
        ".": { import: "./dist/index.mjs", require: "./dist/index.cjs" },
        "./utils": "./dist/utils.js",
      })
    })

    it("decodes funding as an unknown value", () => {
      const input = { name: "pkg", funding: { type: "github", url: "https://github.com/sponsors/user" } }
      const result = decodePackageJson(input)
      expect(result.funding).toEqual({ type: "github", url: "https://github.com/sponsors/user" })
    })

    it("decodes sideEffects and publishConfig", () => {
      const input = {
        name: "pkg",
        sideEffects: false,
        publishConfig: { access: "public" },
      }
      const result = decodePackageJson(input)
      expect(result.sideEffects).toBe(false)
      expect(result.publishConfig).toEqual({ access: "public" })
    })

    it("decodes empty optional record fields", () => {
      const input = { name: "pkg", scripts: {}, dependencies: {}, devDependencies: {} }
      const result = decodePackageJson(input)
      expect(result.scripts).toEqual({})
      expect(result.dependencies).toEqual({})
      expect(result.devDependencies).toEqual({})
    })
  })

  describe("malformed structures", () => {
    it("rejects missing name field", () => {
      const input = { version: "1.0.0" }
      const exit = decodePackageJsonExit(input)
      expect(Exit.isFailure(exit)).toBe(true)
    })

    it("rejects name as a number", () => {
      const input = { name: 123 }
      const exit = decodePackageJsonExit(input)
      expect(Exit.isFailure(exit)).toBe(true)
    })

    it("rejects non-object input", () => {
      expect(Exit.isFailure(decodePackageJsonExit("not-an-object"))).toBe(true)
      expect(Exit.isFailure(decodePackageJsonExit(42))).toBe(true)
      expect(Exit.isFailure(decodePackageJsonExit(null))).toBe(true)
      expect(Exit.isFailure(decodePackageJsonExit(undefined))).toBe(true)
      expect(Exit.isFailure(decodePackageJsonExit([]))).toBe(true)
    })

    it("rejects version as a number", () => {
      const input = { name: "pkg", version: 1 }
      const exit = decodePackageJsonExit(input)
      expect(Exit.isFailure(exit)).toBe(true)
    })

    it("rejects keywords as a string instead of array", () => {
      const input = { name: "pkg", keywords: "not-an-array" }
      const exit = decodePackageJsonExit(input)
      expect(Exit.isFailure(exit)).toBe(true)
    })

    it("rejects dependencies with non-string values", () => {
      const input = { name: "pkg", dependencies: { effect: 4 } }
      const exit = decodePackageJsonExit(input)
      expect(Exit.isFailure(exit)).toBe(true)
    })

    it("rejects scripts with non-string values", () => {
      const input = { name: "pkg", scripts: { build: true } }
      const exit = decodePackageJsonExit(input)
      expect(Exit.isFailure(exit)).toBe(true)
    })

    it("rejects workspaces as a string", () => {
      const input = { name: "pkg", workspaces: "packages/*" }
      const exit = decodePackageJsonExit(input)
      expect(Exit.isFailure(exit)).toBe(true)
    })

    it("rejects author object without name", () => {
      const input = { name: "pkg", author: { email: "a@b.com" } }
      const exit = decodePackageJsonExit(input)
      expect(Exit.isFailure(exit)).toBe(true)
    })

    it("accepts repository object without type via record fallback", () => {
      // Non-standard repository shapes are accepted by the Record<string,unknown>
      // fallback arm so that real-world malformed package.json files still parse.
      const input = { name: "pkg", repository: { url: "git@github.com:user/repo.git" } }
      const exit = decodePackageJsonExit(input)
      expect(Exit.isSuccess(exit)).toBe(true)
    })

    it("rejects private as a string", () => {
      const input = { name: "pkg", private: "true" }
      const exit = decodePackageJsonExit(input)
      expect(Exit.isFailure(exit)).toBe(true)
    })
  })

  describe("edge cases", () => {
    it("handles empty keywords array", () => {
      const input = { name: "pkg", keywords: [] }
      const result = decodePackageJson(input)
      expect(result.keywords).toEqual([])
    })

    it("handles empty workspaces array", () => {
      const input = { name: "pkg", workspaces: [] }
      const result = decodePackageJson(input)
      expect(result.workspaces).toEqual([])
    })

    it("handles empty files array", () => {
      const input = { name: "pkg", files: [] }
      const result = decodePackageJson(input)
      expect(result.files).toEqual([])
    })

    it("handles scoped package names", () => {
      const input = { name: "@scope/package-name" }
      const result = decodePackageJson(input)
      expect(result.name).toBe("@scope/package-name")
    })

    it("handles empty string name", () => {
      const input = { name: "" }
      const result = decodePackageJson(input)
      expect(result.name).toBe("")
    })

    it("handles bugs object with only email", () => {
      const input = { name: "pkg", bugs: { email: "bugs@example.com" } }
      const result = decodePackageJson(input)
      expect(result.bugs).toEqual({ email: "bugs@example.com" })
    })

    it("handles bugs object with only url", () => {
      const input = { name: "pkg", bugs: { url: "https://example.com/issues" } }
      const result = decodePackageJson(input)
      expect(result.bugs).toEqual({ url: "https://example.com/issues" })
    })

    it("decodePackageJson throws on invalid input", () => {
      expect(() => decodePackageJson({})).toThrow()
    })

    it("real-world package.json from this repo", () => {
      const input = {
        name: "@beep/repo-utils",
        version: "0.0.0",
        type: "module",
        private: true,
        license: "MIT",
        description: "Effect-based monorepo utilities",
        homepage: "https://github.com/kriegcloud/beep-effect/tree/main/tooling/repo-utils",
        repository: {
          type: "git",
          url: "git@github.com:kriegcloud/beep-effect.git",
          directory: "tooling/repo-utils",
        },
        sideEffects: [],
        exports: {
          "./package.json": "./package.json",
          ".": "./src/index.ts",
        },
        files: ["src/**/*.ts", "dist/**/*.js"],
        scripts: {
          build: "tsc -b tsconfig.json",
          test: "vitest",
        },
        dependencies: {
          effect: "catalog:",
          "@effect/platform-node": "catalog:",
          glob: "catalog:",
        },
        devDependencies: {
          "@types/node": "catalog:",
          "@effect/vitest": "catalog:",
        },
      }
      const result = decodePackageJson(input)
      expect(result.name).toBe("@beep/repo-utils")
      expect(result.version).toBe("0.0.0")
      expect(result.private).toBe(true)
      expect(result.repository).toEqual({
        type: "git",
        url: "git@github.com:kriegcloud/beep-effect.git",
        directory: "tooling/repo-utils",
      })
    })
  })

  describe("type inference", () => {
    it("schema Type is correctly shaped", () => {
      const schema = PackageJson
      type PkgType = (typeof schema)["Type"]

      // Compile-time assertion: if this compiles, the type is correct
      const _check: PkgType = {
        name: "test",
        version: "1.0.0",
        dependencies: { effect: "^4.0.0" },
      }
      expect(_check.name).toBe("test")
    })
  })
})
