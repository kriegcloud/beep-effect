/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, it } from "vitest";
import * as P from "../primitives.js";

describe("primitives", () => {
  describe("String", () => {
    it("should create a string type", () => {
      expect(P.String).toEqual({ type: "string" });
    });

    it("should have correct type property", () => {
      expect(P.String.type).toBe("string");
    });
  });

  describe("Double", () => {
    it("should create a double type", () => {
      expect(P.Double).toEqual({ type: "double" });
    });

    it("should have correct type property", () => {
      expect(P.Double.type).toBe("double");
    });
  });

  describe("Boolean", () => {
    it("should create a boolean type", () => {
      expect(P.Boolean).toEqual({ type: "boolean" });
    });

    it("should have correct type property", () => {
      expect(P.Boolean.type).toBe("boolean");
    });
  });

  describe("Array", () => {
    it("should create an array of strings", () => {
      const stringArray = P.Array(P.String);
      expect(stringArray).toEqual({
        type: "array",
        items: { type: "string" },
      });
    });

    it("should create an array of doubles", () => {
      const doubleArray = P.Array(P.Double);
      expect(doubleArray).toEqual({
        type: "array",
        items: { type: "double" },
      });
    });

    it("should create nested arrays", () => {
      const nestedArray = P.Array(P.Array(P.String));
      expect(nestedArray).toEqual({
        type: "array",
        items: {
          type: "array",
          items: { type: "string" },
        },
      });
    });

    it("should create arrays of optional types", () => {
      const optionalStringArray = P.Array(P.Optional(P.String));
      expect(optionalStringArray).toEqual({
        type: "array",
        items: {
          type: "optional",
          item: { type: "string" },
        },
      });
    });

    it("should create an array of booleans", () => {
      const booleanArray = P.Array(P.Boolean);
      expect(booleanArray).toEqual({
        type: "array",
        items: { type: "boolean" },
      });
    });
  });

  describe("Optional", () => {
    it("should create an optional string", () => {
      const optionalString = P.Optional(P.String);
      expect(optionalString).toEqual({
        type: "optional",
        item: { type: "string" },
      });
    });

    it("should create an optional double", () => {
      const optionalDouble = P.Optional(P.Double);
      expect(optionalDouble).toEqual({
        type: "optional",
        item: { type: "double" },
      });
    });

    it("should create optional arrays", () => {
      const optionalArray = P.Optional(P.Array(P.String));
      expect(optionalArray).toEqual({
        type: "optional",
        item: {
          type: "array",
          items: { type: "string" },
        },
      });
    });

    it("should handle nested optional types", () => {
      const doubleOptional = P.Optional(P.Optional(P.String));
      expect(doubleOptional).toEqual({
        type: "optional",
        item: {
          type: "optional",
          item: { type: "string" },
        },
      });
    });

    it("should create an optional boolean", () => {
      const optionalBoolean = P.Optional(P.Boolean);
      expect(optionalBoolean).toEqual({
        type: "optional",
        item: { type: "boolean" },
      });
    });

    it("should create optional array of booleans", () => {
      const optionalBooleanArray = P.Optional(P.Array(P.Boolean));
      expect(optionalBooleanArray).toEqual({
        type: "optional",
        item: {
          type: "array",
          items: { type: "boolean" },
        },
      });
    });

    it("should create array of optional booleans", () => {
      const arrayOfOptionalBooleans = P.Array(P.Optional(P.Boolean));
      expect(arrayOfOptionalBooleans).toEqual({
        type: "array",
        items: {
          type: "optional",
          item: { type: "boolean" },
        },
      });
    });
  });

  describe("Type combinations", () => {
    it("should create complex nested structures", () => {
      const complexType = P.Optional(P.Array(P.Optional(P.Array(P.String))));
      expect(complexType).toEqual({
        type: "optional",
        item: {
          type: "array",
          items: {
            type: "optional",
            item: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      });
    });

    it("should maintain immutability of primitive types", () => {
      const string1 = P.String;
      const string2 = P.String;
      expect(string1).toBe(string2);
      expect(string1 === string2).toBe(true);
    });

    it("should create new instances for constructed types", () => {
      const array1 = P.Array(P.String);
      const array2 = P.Array(P.String);
      expect(array1).toEqual(array2);
      expect(array1 === array2).toBe(false);
    });

    it("should create complex nested structures with booleans", () => {
      const complexBooleanType = P.Optional(P.Array(P.Optional(P.Boolean)));
      expect(complexBooleanType).toEqual({
        type: "optional",
        item: {
          type: "array",
          items: {
            type: "optional",
            item: { type: "boolean" },
          },
        },
      });
    });

    it("should maintain immutability of boolean primitive", () => {
      const boolean1 = P.Boolean;
      const boolean2 = P.Boolean;
      expect(boolean1).toBe(boolean2);
      expect(boolean1 === boolean2).toBe(true);
    });
  });
});
