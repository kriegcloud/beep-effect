import { describe, expect, it } from "tstyche";
import { type CyclicDependencyError, DomainError, NoSuchFileError } from "../src/index.js";

describe("Errors", () => {
  describe("NoSuchFileError", () => {
    it("has _tag 'NoSuchFileError'", () => {
      expect<NoSuchFileError["_tag"]>().type.toBe<"NoSuchFileError">();
    });

    it("has path field", () => {
      expect<NoSuchFileError["path"]>().type.toBe<string>();
    });

    it("has message field", () => {
      expect<NoSuchFileError["message"]>().type.toBe<string>();
    });

    it("is constructible", () => {
      const err = new NoSuchFileError({ path: "/foo", message: "not found" });
      expect(err).type.toBeAssignableTo<NoSuchFileError>();
    });
  });

  describe("DomainError", () => {
    it("has _tag 'DomainError'", () => {
      expect<DomainError["_tag"]>().type.toBe<"DomainError">();
    });

    it("has message field", () => {
      expect<DomainError["message"]>().type.toBe<string>();
    });

    it("is constructible with optional cause", () => {
      const err = new DomainError({ message: "failed" });
      expect(err).type.toBeAssignableTo<DomainError>();
    });
  });

  describe("CyclicDependencyError", () => {
    it("has _tag 'CyclicDependencyError'", () => {
      expect<CyclicDependencyError["_tag"]>().type.toBe<"CyclicDependencyError">();
    });

    it("has cycles field", () => {
      expect<CyclicDependencyError["cycles"]>().type.toBe<ReadonlyArray<ReadonlyArray<string>>>();
    });
  });
});
