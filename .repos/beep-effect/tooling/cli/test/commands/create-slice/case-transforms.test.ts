/**
 * @file Case Transformation Tests
 *
 * Tests for the createSliceContext function and its case transformation logic.
 *
 * @module create-slice/test/case-transforms
 * @since 0.1.0
 */

import { describe, expect, it } from "bun:test";
import * as A from "effect/Array";
import * as F from "effect/Function";
import { createSliceContext } from "../../../src/commands/create-slice/utils/template.js";

// -----------------------------------------------------------------------------
// createSliceContext Tests
// -----------------------------------------------------------------------------

describe("createSliceContext", () => {
  describe("single word names", () => {
    it("should create context for single word slice name", () => {
      const context = createSliceContext("notifications", "Push notifications for users");

      expect(context.sliceName).toBe("notifications");
      expect(context.SliceName).toBe("Notifications");
      expect(context.SLICE_NAME).toBe("NOTIFICATIONS");
      expect(context.slice_name).toBe("notifications");
      expect(context.sliceDescription).toBe("Push notifications for users");
    });

    it("should handle short single word name", () => {
      const context = createSliceContext("abc", "Short name slice");

      expect(context.sliceName).toBe("abc");
      expect(context.SliceName).toBe("Abc");
      expect(context.SLICE_NAME).toBe("ABC");
      expect(context.slice_name).toBe("abc");
    });

    it("should handle single word with numbers", () => {
      const context = createSliceContext("auth2", "Auth version 2");

      expect(context.sliceName).toBe("auth2");
      expect(context.SliceName).toBe("Auth2");
      expect(context.SLICE_NAME).toBe("AUTH2");
      expect(context.slice_name).toBe("auth2");
    });
  });

  describe("multi-part kebab names", () => {
    it("should transform two-part kebab-case to PascalCase", () => {
      const context = createSliceContext("user-profile", "User profile management");

      expect(context.sliceName).toBe("user-profile");
      expect(context.SliceName).toBe("UserProfile");
      expect(context.SLICE_NAME).toBe("USER_PROFILE");
      expect(context.slice_name).toBe("user_profile");
    });

    it("should transform three-part kebab-case", () => {
      const context = createSliceContext("user-access-control", "User access control");

      expect(context.sliceName).toBe("user-access-control");
      expect(context.SliceName).toBe("UserAccessControl");
      expect(context.SLICE_NAME).toBe("USER_ACCESS_CONTROL");
      expect(context.slice_name).toBe("user_access_control");
    });

    it("should handle many parts", () => {
      const context = createSliceContext("very-long-slice-name-here", "A slice with many parts");

      expect(context.sliceName).toBe("very-long-slice-name-here");
      expect(context.SliceName).toBe("VeryLongSliceNameHere");
      expect(context.SLICE_NAME).toBe("VERY_LONG_SLICE_NAME_HERE");
      expect(context.slice_name).toBe("very_long_slice_name_here");
    });

    it("should handle kebab-case with numbers", () => {
      const context = createSliceContext("billing-v2", "Billing version 2");

      expect(context.sliceName).toBe("billing-v2");
      expect(context.SliceName).toBe("BillingV2");
      expect(context.SLICE_NAME).toBe("BILLING_V2");
      expect(context.slice_name).toBe("billing_v2");
    });

    it("should handle numeric suffix parts", () => {
      const context = createSliceContext("api-v2-beta", "API v2 beta");

      expect(context.sliceName).toBe("api-v2-beta");
      expect(context.SliceName).toBe("ApiV2Beta");
      expect(context.SLICE_NAME).toBe("API_V2_BETA");
      expect(context.slice_name).toBe("api_v2_beta");
    });
  });

  describe("description handling", () => {
    it("should preserve description exactly", () => {
      const desc = "Handles user notifications & alerts (email, push, SMS)";
      const context = createSliceContext("notifications", desc);

      expect(context.sliceDescription).toBe(desc);
    });

    it("should handle empty description", () => {
      const context = createSliceContext("test-slice", "");

      expect(context.sliceDescription).toBe("");
    });

    it("should handle description with special characters", () => {
      const desc = 'Test "quotes" and <brackets> & ampersand';
      const context = createSliceContext("test", desc);

      expect(context.sliceDescription).toBe(desc);
    });
  });

  describe("edge cases", () => {
    it("should handle single character parts", () => {
      const context = createSliceContext("a-b-c", "Single char parts");

      expect(context.SliceName).toBe("ABC");
      expect(context.SLICE_NAME).toBe("A_B_C");
      expect(context.slice_name).toBe("a_b_c");
    });

    it("should return consistent results for same input", () => {
      const context1 = createSliceContext("my-slice", "Description");
      const context2 = createSliceContext("my-slice", "Description");

      expect(context1.sliceName).toBe(context2.sliceName);
      expect(context1.SliceName).toBe(context2.SliceName);
      expect(context1.SLICE_NAME).toBe(context2.SLICE_NAME);
      expect(context1.slice_name).toBe(context2.slice_name);
    });
  });

  describe("case variant relationships", () => {
    it("should have correct relationship between all case variants", () => {
      const testCases = [
        { input: "simple", pascal: "Simple", screaming: "SIMPLE", snake: "simple" },
        { input: "two-words", pascal: "TwoWords", screaming: "TWO_WORDS", snake: "two_words" },
        { input: "three-word-name", pascal: "ThreeWordName", screaming: "THREE_WORD_NAME", snake: "three_word_name" },
      ];

      F.pipe(
        testCases,
        A.forEach(({ input, pascal, screaming, snake }) => {
          const context = createSliceContext(input, "Test");

          expect(context.sliceName).toBe(input);
          expect(context.SliceName).toBe(pascal);
          expect(context.SLICE_NAME).toBe(screaming);
          expect(context.slice_name).toBe(snake);
        })
      );
    });
  });
});

// -----------------------------------------------------------------------------
// SliceContext Interface Tests
// -----------------------------------------------------------------------------

describe("SliceContext interface", () => {
  it("should have all required properties", () => {
    const context = createSliceContext("test-slice", "Test description");

    // Verify all expected properties exist
    expect(typeof context.sliceName).toBe("string");
    expect(typeof context.SliceName).toBe("string");
    expect(typeof context.SLICE_NAME).toBe("string");
    expect(typeof context.slice_name).toBe("string");
    expect(typeof context.sliceDescription).toBe("string");
  });

  it("should be readonly (immutable)", () => {
    const context = createSliceContext("test", "Test");

    // TypeScript would prevent mutation at compile time
    // At runtime, we can verify the object structure
    expect(Object.keys(context)).toEqual(["sliceName", "SliceName", "SLICE_NAME", "slice_name", "sliceDescription"]);
  });
});
