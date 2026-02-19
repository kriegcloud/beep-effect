import { describe, expect, it } from "@effect/vitest"
import { HashSet } from "effect"
import { extractWorkspaceDependencies } from "../src/Dependencies.js"
import type { PackageJson } from "../src/schemas/PackageJson.js"

describe("Dependencies", () => {
  const workspaceNames = HashSet.make("@mock/pkg-a", "@mock/pkg-b", "@mock/pkg-c")

  describe("extractWorkspaceDependencies", () => {
    it("should classify workspace dependencies separately from npm dependencies", () => {
      const pkg: PackageJson = {
        name: "@mock/pkg-a",
        dependencies: {
          "@mock/pkg-b": "workspace:*",
          "effect": "^3.0.0",
        },
      }

      const result = extractWorkspaceDependencies(pkg, workspaceNames)

      expect(result.packageName).toBe("@mock/pkg-a")
      expect(result.workspace.dependencies).toEqual({ "@mock/pkg-b": "workspace:*" })
      expect(result.npm.dependencies).toEqual({ "effect": "^3.0.0" })
    })

    it("should classify devDependencies correctly", () => {
      const pkg: PackageJson = {
        name: "@mock/pkg-b",
        devDependencies: {
          "@mock/pkg-c": "workspace:*",
          "vitest": "^1.0.0",
        },
      }

      const result = extractWorkspaceDependencies(pkg, workspaceNames)

      expect(result.workspace.devDependencies).toEqual({ "@mock/pkg-c": "workspace:*" })
      expect(result.npm.devDependencies).toEqual({ "vitest": "^1.0.0" })
    })

    it("should classify peerDependencies correctly", () => {
      const pkg: PackageJson = {
        name: "@mock/pkg-c",
        peerDependencies: {
          "@mock/pkg-a": ">=1.0.0",
          "react": "^18.0.0",
        },
      }

      const result = extractWorkspaceDependencies(pkg, workspaceNames)

      expect(result.workspace.peerDependencies).toEqual({ "@mock/pkg-a": ">=1.0.0" })
      expect(result.npm.peerDependencies).toEqual({ "react": "^18.0.0" })
    })

    it("should classify optionalDependencies correctly", () => {
      const pkg: PackageJson = {
        name: "@mock/pkg-a",
        optionalDependencies: {
          "@mock/pkg-c": "workspace:*",
          "fsevents": "^2.3.0",
        },
      }

      const result = extractWorkspaceDependencies(pkg, workspaceNames)

      expect(result.workspace.optionalDependencies).toEqual({ "@mock/pkg-c": "workspace:*" })
      expect(result.npm.optionalDependencies).toEqual({ "fsevents": "^2.3.0" })
    })

    it("should handle package with no dependencies", () => {
      const pkg: PackageJson = {
        name: "@mock/empty",
      }

      const result = extractWorkspaceDependencies(pkg, workspaceNames)

      expect(result.packageName).toBe("@mock/empty")
      expect(result.workspace.dependencies).toEqual({})
      expect(result.workspace.devDependencies).toEqual({})
      expect(result.workspace.peerDependencies).toEqual({})
      expect(result.workspace.optionalDependencies).toEqual({})
      expect(result.npm.dependencies).toEqual({})
      expect(result.npm.devDependencies).toEqual({})
      expect(result.npm.peerDependencies).toEqual({})
      expect(result.npm.optionalDependencies).toEqual({})
    })

    it("should handle all-workspace dependencies", () => {
      const pkg: PackageJson = {
        name: "@mock/consumer",
        dependencies: {
          "@mock/pkg-a": "workspace:*",
          "@mock/pkg-b": "workspace:*",
          "@mock/pkg-c": "workspace:*",
        },
      }

      const result = extractWorkspaceDependencies(pkg, workspaceNames)

      expect(Object.keys(result.workspace.dependencies)).toHaveLength(3)
      expect(Object.keys(result.npm.dependencies)).toHaveLength(0)
    })

    it("should handle all-npm dependencies", () => {
      const pkg: PackageJson = {
        name: "@mock/external-only",
        dependencies: {
          "lodash": "^4.0.0",
          "express": "^4.18.0",
        },
      }

      const result = extractWorkspaceDependencies(pkg, workspaceNames)

      expect(Object.keys(result.workspace.dependencies)).toHaveLength(0)
      expect(Object.keys(result.npm.dependencies)).toHaveLength(2)
    })

    it("should use empty HashSet to treat all deps as npm", () => {
      const pkg: PackageJson = {
        name: "@mock/pkg-a",
        dependencies: {
          "@mock/pkg-b": "workspace:*",
          "effect": "^3.0.0",
        },
      }

      const result = extractWorkspaceDependencies(pkg, HashSet.empty<string>())

      expect(Object.keys(result.workspace.dependencies)).toHaveLength(0)
      expect(Object.keys(result.npm.dependencies)).toHaveLength(2)
    })
  })
})
