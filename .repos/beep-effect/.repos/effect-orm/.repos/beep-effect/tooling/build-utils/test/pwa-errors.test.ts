// import { describe, expect, it } from "@beep/testkit";
// import { FileNotFoundError, FileReadError, GlobError, WebpackBuildError } from "../src/pwa/errors.js";
//
// describe("PWA Errors", () => {
//   describe("WebpackBuildError", () => {
//     it("should create an error with message only", () => {
//       const error = new WebpackBuildError({ message: "Build failed" });
//
//       expect(error._tag).toBe("WebpackBuildError");
//       expect(error.message).toBe("Build failed");
//       expect(error.details).toBeUndefined();
//     });
//
//     it("should create an error with message and details", () => {
//       const error = new WebpackBuildError({
//         message: "Build failed",
//         details: "Module not found: webpack.config.js",
//       });
//
//       expect(error._tag).toBe("WebpackBuildError");
//       expect(error.message).toBe("Build failed");
//       expect(error.details).toBe("Module not found: webpack.config.js");
//     });
//
//     it("should have _tag property for discrimination", () => {
//       const error = new WebpackBuildError({ message: "test" });
//
//       expect(error._tag).toBe("WebpackBuildError");
//       expect(typeof error._tag).toBe("string");
//     });
//
//     it("should be an instance of Error", () => {
//       const error = new WebpackBuildError({ message: "test" });
//
//       expect(error).toBeInstanceOf(Error);
//     });
//   });
//
//   describe("FileNotFoundError", () => {
//     it("should create an error with path and message", () => {
//       const error = new FileNotFoundError({
//         path: "/app/sw.js",
//         message: "Service worker file not found",
//       });
//
//       expect(error._tag).toBe("FileNotFoundError");
//       expect(error.path).toBe("/app/sw.js");
//       expect(error.message).toBe("Service worker file not found");
//     });
//
//     it("should have _tag property for discrimination", () => {
//       const error = new FileNotFoundError({ path: "/test", message: "not found" });
//
//       expect(error._tag).toBe("FileNotFoundError");
//       expect(typeof error._tag).toBe("string");
//     });
//
//     it("should be an instance of Error", () => {
//       const error = new FileNotFoundError({ path: "/test", message: "not found" });
//
//       expect(error).toBeInstanceOf(Error);
//     });
//   });
//
//   describe("FileReadError", () => {
//     it("should create an error with path, message, and optional cause", () => {
//       const cause = new Error("EACCES: permission denied");
//       const error = new FileReadError({
//         path: "/app/config.json",
//         message: "Failed to read config",
//         cause,
//       });
//
//       expect(error._tag).toBe("FileReadError");
//       expect(error.path).toBe("/app/config.json");
//       expect(error.message).toBe("Failed to read config");
//       expect(error.cause).toBe(cause);
//     });
//
//     it("should create an error without cause", () => {
//       const error = new FileReadError({
//         path: "/app/config.json",
//         message: "Failed to read config",
//       });
//
//       expect(error._tag).toBe("FileReadError");
//       expect(error.cause).toBeUndefined();
//     });
//
//     it("should have _tag property for discrimination", () => {
//       const error = new FileReadError({ path: "/test", message: "read error" });
//
//       expect(error._tag).toBe("FileReadError");
//       expect(typeof error._tag).toBe("string");
//     });
//
//     it("should be an instance of Error", () => {
//       const error = new FileReadError({ path: "/test", message: "read error" });
//
//       expect(error).toBeInstanceOf(Error);
//     });
//   });
//
//   describe("GlobError", () => {
//     it("should create an error with string pattern", () => {
//       const error = new GlobError({
//         pattern: "**/*.ts",
//         message: "Glob pattern failed",
//       });
//
//       expect(error._tag).toBe("GlobError");
//       expect(error.pattern).toBe("**/*.ts");
//       expect(error.message).toBe("Glob pattern failed");
//     });
//
//     it("should create an error with array pattern", () => {
//       const patterns = ["**/*.ts", "**/*.tsx"] as const;
//       const error = new GlobError({
//         pattern: patterns,
//         message: "Multiple patterns failed",
//       });
//
//       expect(error._tag).toBe("GlobError");
//       expect(error.pattern).toEqual(patterns);
//     });
//
//     it("should create an error with cause", () => {
//       const cause = new Error("Invalid glob syntax");
//       const error = new GlobError({
//         pattern: "[invalid",
//         message: "Invalid pattern",
//         cause,
//       });
//
//       expect(error.cause).toBe(cause);
//     });
//
//     it("should have _tag property for discrimination", () => {
//       const error = new GlobError({ pattern: "*.ts", message: "error" });
//
//       expect(error._tag).toBe("GlobError");
//       expect(typeof error._tag).toBe("string");
//     });
//
//     it("should be an instance of Error", () => {
//       const error = new GlobError({ pattern: "*.ts", message: "error" });
//
//       expect(error).toBeInstanceOf(Error);
//     });
//   });
// });
