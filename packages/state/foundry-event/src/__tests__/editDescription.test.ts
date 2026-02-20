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

import { getMetadata, Metadata, type Model } from "@palantir/pack.document-schema.model-types";
import { describe, expect, it } from "vitest";

interface User {
  email: string;
  id: string;
  name: string;
}

const UserModel: Model<User> = {
  __type: {} as User,
  zodSchema: {} as Model<User>["zodSchema"],
  [Metadata]: {
    name: "User",
  },
};

function isEditDescription(obj: unknown): obj is { data: unknown; model: Model } {
  return (
    obj != null
    && typeof obj === "object"
    && "data" in obj
    && "model" in obj
    && typeof obj.model === "object"
    && obj.model != null
    && Metadata in obj.model
  );
}

function createDocumentEditDescription(editDescription: { data: unknown; model: Model }) {
  return {
    eventData: {
      data: editDescription.data,
      version: 1,
    },
    eventType: getMetadata(editDescription.model).name,
  };
}

describe("EditDescription helpers", () => {
  describe("isEditDescription", () => {
    it("should recognize valid EditDescription", () => {
      const validDescription = {
        data: {
          email: "alice@example.com",
          id: "user1",
          name: "Alice",
        },
        model: UserModel,
      };

      expect(isEditDescription(validDescription)).toBe(true);
    });

    it("should reject null", () => {
      expect(isEditDescription(null)).toBe(false);
    });

    it("should reject undefined", () => {
      expect(isEditDescription(undefined)).toBe(false);
    });

    it("should reject object without data field", () => {
      expect(isEditDescription({ model: UserModel })).toBe(false);
    });

    it("should reject object without model field", () => {
      expect(isEditDescription({ data: { email: "test@example.com", id: "1", name: "test" } }))
        .toBe(false);
    });

    it("should reject object with null model", () => {
      expect(
        isEditDescription({
          data: { email: "test@example.com", id: "1", name: "test" },
          model: null,
        }),
      ).toBe(false);
    });

    it("should reject object with model without Metadata", () => {
      expect(
        isEditDescription({
          data: { email: "test@example.com", id: "1", name: "test" },
          model: { name: "User" },
        }),
      ).toBe(false);
    });

    it("should reject primitive values", () => {
      expect(isEditDescription("string")).toBe(false);
      expect(isEditDescription(123)).toBe(false);
      expect(isEditDescription(true)).toBe(false);
    });
  });

  describe("createDocumentEditDescription", () => {
    it("should create DocumentEditDescription from EditDescription", () => {
      const editDescription = {
        data: {
          email: "alice@example.com",
          id: "user1",
          name: "Alice",
        },
        model: UserModel,
      };

      const result = createDocumentEditDescription(editDescription);

      expect(result).toEqual({
        eventData: {
          data: {
            email: "alice@example.com",
            id: "user1",
            name: "Alice",
          },
          version: 1,
        },
        eventType: "User",
      });
    });

    it("should extract correct model name from metadata", () => {
      const AnotherModel: Model<{ id: string }> = {
        __type: {} as { id: string },
        zodSchema: {} as Model<{ id: string }>["zodSchema"],
        [Metadata]: {
          name: "AnotherModel",
        },
      };

      const editDescription = {
        data: { id: "123" },
        model: AnotherModel,
      };

      const result = createDocumentEditDescription(editDescription);

      expect(result.eventType).toBe("AnotherModel");
      expect(result.eventData.data).toEqual({ id: "123" });
    });
  });
});
