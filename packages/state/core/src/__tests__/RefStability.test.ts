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

import type { PackAppInternal } from "@palantir/pack.core";
import type {
  DocumentId,
  DocumentMetadata,
  DocumentSchema,
  Model,
  RecordId,
} from "@palantir/pack.document-schema.model-types";
import { Metadata } from "@palantir/pack.document-schema.model-types";
import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { createDocRef, invalidDocRef, isValidDocRef } from "../types/DocumentRefImpl.js";
import {
  invalidRecordCollectionRef,
  isValidRecordCollectionRef,
} from "../types/RecordCollectionRefImpl.js";
import { invalidRecordRef, isValidRecordRef } from "../types/RecordRefImpl.js";
import { getStateModule } from "../types/StateModule.js";
import { createTestApp } from "./testUtils.js";

const TEST_SECURITY = {
  mandatory: {
    classification: ["MU"],
    markings: [],
  },
  discretionary: {
    owners: [],
    editors: [],
    viewers: [],
  },
};

// Test schema with User and Post models
const createTestSchema = () => {
  const userSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  });

  const postSchema = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    authorId: z.string(),
  });

  type User = { id: string; name: string; email: string };
  type Post = { id: string; title: string; content: string; authorId: string };

  const User: Model<User, typeof userSchema> = {
    __type: {} as User,
    zodSchema: userSchema,
    [Metadata]: { name: "User" },
  };

  const Post: Model<Post, typeof postSchema> = {
    __type: {} as Post,
    zodSchema: postSchema,
    [Metadata]: { name: "Post" },
  };

  const schema: DocumentSchema = {
    [Metadata]: { version: 1 },
    User,
    Post,
  };

  return { schema, User, Post };
};

describe("Ref Stability Tests", () => {
  let app: PackAppInternal;
  const { schema, User, Post } = createTestSchema();

  beforeEach(() => {
    app = createTestApp();
  });

  describe("DocumentRef Stability", () => {
    it("should return the same DocumentRef instance for identical parameters", () => {
      const stateModule = getStateModule(app);
      const docId = "test-doc-1" as DocumentId;

      // Create multiple refs with same parameters
      const ref1 = stateModule.createDocRef(docId, schema);
      const ref2 = stateModule.createDocRef(docId, schema);
      const ref3 = stateModule.createDocRef(docId, schema);

      // Should be the exact same instance (reference equality)
      expect(ref1).toBe(ref2);
      expect(ref2).toBe(ref3);
      expect(ref1).toBe(ref3);
    });

    it("should return different instances for different document IDs", () => {
      const stateModule = getStateModule(app);
      const docId1 = "test-doc-1" as DocumentId;
      const docId2 = "test-doc-2" as DocumentId;

      const ref1 = stateModule.createDocRef(docId1, schema);
      const ref2 = stateModule.createDocRef(docId2, schema);

      // Should be different instances
      expect(ref1).not.toBe(ref2);
      expect(ref1.id).toBe(docId1);
      expect(ref2.id).toBe(docId2);
    });

    it("should work with invalid refs", () => {
      const invalidRef = invalidDocRef();
      expect(isValidDocRef(invalidRef)).toBe(false);

      const validRef = createDocRef(app, "valid-doc" as DocumentId, schema);
      expect(isValidDocRef(validRef)).toBe(true);
    });
  });

  describe("RecordCollectionRef Stability", () => {
    it("should return the same RecordCollectionRef instance for identical parameters", async () => {
      const stateModule = getStateModule(app);

      // Create a document first
      const metadata: DocumentMetadata = {
        name: "Test Document",
        documentTypeName: "TestType",
        ontologyRid: "test-ontology-rid",
        security: TEST_SECURITY,
      };
      const docRef = await stateModule.createDocument(metadata, schema);

      // Get collection refs multiple times
      const collection1 = docRef.getRecords(User);
      const collection2 = docRef.getRecords(User);
      const collection3 = docRef.getRecords(User);

      // Should be the exact same instance (reference equality)
      expect(collection1).toBe(collection2);
      expect(collection2).toBe(collection3);
      expect(collection1).toBe(collection3);
    });

    it("should return different instances for different models", async () => {
      const stateModule = getStateModule(app);

      const metadata: DocumentMetadata = {
        name: "Test Document",
        documentTypeName: "TestType",
        ontologyRid: "test-ontology-rid",
        security: TEST_SECURITY,
      };
      const docRef = await stateModule.createDocument(metadata, schema);

      const userCollection = docRef.getRecords(User);
      const postCollection = docRef.getRecords(Post);

      // Should be different instances
      expect(userCollection).not.toBe(postCollection);
      expect(userCollection.model).toBe(User);
      expect(postCollection.model).toBe(Post);
    });

    it("should return different instances for different documents", async () => {
      const stateModule = getStateModule(app);

      const metadata1: DocumentMetadata = {
        name: "Test Document 1",
        documentTypeName: "TestType",
        ontologyRid: "test-ontology-rid",
        security: TEST_SECURITY,
      };
      const metadata2: DocumentMetadata = {
        name: "Test Document 2",
        documentTypeName: "TestType",
        ontologyRid: "test-ontology-rid",
        security: TEST_SECURITY,
      };

      const docRef1 = await stateModule.createDocument(metadata1, schema);
      const docRef2 = await stateModule.createDocument(metadata2, schema);

      const collection1 = docRef1.getRecords(User);
      const collection2 = docRef2.getRecords(User);

      // Should be different instances
      expect(collection1).not.toBe(collection2);
      expect(collection1.docRef).toBe(docRef1);
      expect(collection2.docRef).toBe(docRef2);
    });

    it("should work with invalid refs", async () => {
      const invalidRef = invalidRecordCollectionRef();
      expect(isValidRecordCollectionRef(invalidRef)).toBe(false);

      // All methods should be safe to call
      expect(invalidRef.get("any-id" as RecordId)).toBeUndefined();
      expect(invalidRef.has("any-id" as RecordId)).toBe(false);
      expect(invalidRef.size).toBe(0);

      // Async methods should reject
      await expect(invalidRef.set("id" as RecordId, {})).rejects.toThrow();
      await expect(invalidRef.delete("id" as RecordId)).rejects.toThrow();

      // Iterator should be empty
      const iterator = invalidRef[Symbol.iterator]();
      const result = iterator.next();
      expect(result.done).toBe(true);
    });
  });

  describe("RecordRef Stability", () => {
    it("should return the same RecordRef instance for identical parameters", async () => {
      const stateModule = getStateModule(app);

      const metadata: DocumentMetadata = {
        name: "Test Document",
        documentTypeName: "TestType",
        ontologyRid: "test-ontology-rid",
        security: TEST_SECURITY,
      };
      const docRef = await stateModule.createDocument(metadata, schema);
      const userCollection = docRef.getRecords(User);
      const userId = "user-1" as RecordId;

      // Create the record first
      await userCollection.set(userId, {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
      });

      // Get record refs multiple times
      const record1 = userCollection.get(userId);
      const record2 = userCollection.get(userId);
      const record3 = userCollection.get(userId);

      // Should be the exact same instance (reference equality)
      expect(record1).toBe(record2);
      expect(record2).toBe(record3);
      expect(record1).toBe(record3);
    });

    it("should return stable refs even for non-existent records", async () => {
      const stateModule = getStateModule(app);

      const metadata: DocumentMetadata = {
        name: "Test Document",
        documentTypeName: "TestType",
        ontologyRid: "test-ontology-rid",
        security: TEST_SECURITY,
      };
      const docRef = await stateModule.createDocument(metadata, schema);

      const nonExistentId = "non-existent" as RecordId;

      const ref1 = stateModule.createRecordRef(docRef, nonExistentId, User);
      const ref2 = stateModule.createRecordRef(docRef, nonExistentId, User);

      expect(ref1).toBe(ref2);
    });

    it("should return different instances for different record IDs", async () => {
      const stateModule = getStateModule(app);

      const metadata: DocumentMetadata = {
        name: "Test Document",
        documentTypeName: "TestType",
        ontologyRid: "test-ontology-rid",
        security: TEST_SECURITY,
      };
      const docRef = await stateModule.createDocument(metadata, schema);
      const userCollection = docRef.getRecords(User);

      const userId1 = "user-1" as RecordId;
      const userId2 = "user-2" as RecordId;

      // Create both records
      await userCollection.set(userId1, {
        id: "user-1",
        name: "User 1",
        email: "user1@example.com",
      });
      await userCollection.set(userId2, {
        id: "user-2",
        name: "User 2",
        email: "user2@example.com",
      });

      const record1 = userCollection.get(userId1);
      const record2 = userCollection.get(userId2);

      // Should be different instances
      expect(record1).not.toBe(record2);
      expect(record1?.id).toBe(userId1);
      expect(record2?.id).toBe(userId2);
    });

    it("should return different instances for different models", async () => {
      const stateModule = getStateModule(app);

      const metadata: DocumentMetadata = {
        name: "Test Document",
        documentTypeName: "TestType",
        ontologyRid: "test-ontology-rid",
        security: TEST_SECURITY,
      };
      const docRef = await stateModule.createDocument(metadata, schema);

      const userCollection = docRef.getRecords(User);
      const postCollection = docRef.getRecords(Post);

      const recordId = "same-id" as RecordId;

      // Create records with same ID but different models
      await userCollection.set(recordId, {
        id: "same-id",
        name: "Test User",
        email: "test@example.com",
      });
      await postCollection.set(recordId, {
        id: "same-id",
        title: "Test Post",
        content: "Test content",
        authorId: "user-1",
      });

      const userRecord = userCollection.get(recordId);
      const postRecord = postCollection.get(recordId);

      // Should be different instances
      expect(userRecord).not.toBe(postRecord);
      expect(userRecord?.model).toBe(User);
      expect(postRecord?.model).toBe(Post);
    });

    it("should work with invalid refs", async () => {
      const invalidRef = invalidRecordRef();
      expect(isValidRecordRef(invalidRef)).toBe(false);

      // Async methods should reject
      await expect(invalidRef.getSnapshot()).rejects.toThrow();
      await expect(invalidRef.set({})).rejects.toThrow();

      // Subscription methods should be safe
      const unsubscribe1 = invalidRef.onChange(() => {});
      const unsubscribe2 = invalidRef.onDeleted(() => {});

      expect(typeof unsubscribe1).toBe("function");
      expect(typeof unsubscribe2).toBe("function");

      // Should be safe to call
      unsubscribe1();
      unsubscribe2();
    });
  });

  describe("Cross-reference Stability", () => {
    it("should maintain stable refs across collection iterations", async () => {
      const stateModule = getStateModule(app);

      const metadata: DocumentMetadata = {
        name: "Test Document",
        documentTypeName: "TestType",
        ontologyRid: "test-ontology-rid",
        security: TEST_SECURITY,
      };
      const docRef = await stateModule.createDocument(metadata, schema);
      const userCollection = docRef.getRecords(User);

      // Create multiple users
      const userIds = ["user-1", "user-2", "user-3"] as RecordId[];
      for (const userId of userIds) {
        await userCollection.set(userId, {
          id: userId,
          name: `User ${userId}`,
          email: `${userId}@example.com`,
        });
      }

      // Get refs through iteration
      const iterationRefs = Array.from(userCollection);

      // Get refs through direct access
      const directRefs = userIds.map(id => userCollection.get(id)!);

      // Should be the same instances
      expect(iterationRefs).toHaveLength(3);
      expect(directRefs).toHaveLength(3);

      for (let i = 0; i < userIds.length; i++) {
        const iterationRef = iterationRefs.find(ref => ref.id === userIds[i]);
        const directRef = directRefs[i];

        expect(iterationRef).toBeDefined();
        expect(iterationRef).toBe(directRef);
      }
    });

    it("should maintain stable document refs when accessed through different paths", async () => {
      const stateModule = getStateModule(app);

      const metadata: DocumentMetadata = {
        name: "Test Document",
        documentTypeName: "TestType",
        ontologyRid: "test-ontology-rid",
        security: TEST_SECURITY,
      };

      // Create doc through state module
      const docRef1 = await stateModule.createDocument(metadata, schema);

      // Get doc through createDocRef using the actual document ID
      const docRef2 = stateModule.createDocRef(docRef1.id, schema);

      // Get doc through collection's docRef
      const collection = docRef1.getRecords(User);
      const docRef3 = collection.docRef;

      // Should be the same instances
      expect(docRef1).toBe(docRef2);
      expect(docRef2).toBe(docRef3);
      expect(docRef1).toBe(docRef3);
    });
  });
});
