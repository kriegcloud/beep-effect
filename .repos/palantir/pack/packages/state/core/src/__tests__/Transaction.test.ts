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
  DocumentMetadata,
  DocumentRef,
  DocumentSchema,
  Model,
  RecordId,
  RecordRef,
} from "@palantir/pack.document-schema.model-types";
import { Metadata } from "@palantir/pack.document-schema.model-types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as Y from "yjs";
import { z } from "zod";
import { DOCUMENT_SERVICE_MODULE_KEY } from "../DocumentServiceModule.js";
import type { BaseYjsDocumentService } from "../service/BaseYjsDocumentService.js";
import { getStateModule } from "../types/StateModule.js";
import { createTestApp } from "./testUtils.js";

const TEST_SECURITY = {
  discretionary: {
    editors: [],
    owners: [],
    viewers: [],
  },
  mandatory: {
    classification: ["MU"],
    markings: [],
  },
};

interface User {
  email: string;
  id: string;
  name: string;
}

const createSchemaWithRecords = () => {
  const userSchema = z.object({
    email: z.email(),
    id: z.string(),
    name: z.string(),
  });

  const UserModel: Model<User, typeof userSchema> = {
    __type: {} as User,
    zodSchema: userSchema,
    [Metadata]: {
      name: "User",
    },
  };

  return {
    User: UserModel,
    [Metadata]: {
      version: 1,
    },
  } as const satisfies DocumentSchema;
};

describe("Transaction Batching", () => {
  let app: PackAppInternal;
  let docRef: DocumentRef<ReturnType<typeof createSchemaWithRecords>>;
  let schema: ReturnType<typeof createSchemaWithRecords>;

  beforeEach(async () => {
    app = createTestApp();
    const stateModule = getStateModule(app);

    const metadata: DocumentMetadata = {
      documentTypeName: "TestType",
      name: "Test Document",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    schema = createSchemaWithRecords();
    docRef = await stateModule.createDocument(metadata, schema);
  });

  it("should batch multiple setRecord operations into single Y.js transaction", async () => {
    const collection = docRef.getRecords(schema.User);
    const stateModule = getStateModule(app);

    let stateChangeCount = 0;
    const unsubscribe = stateModule.onStateChange(docRef, () => {
      stateChangeCount++;
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    const initialCount = stateChangeCount;

    const userId1 = "user1" as RecordId;
    const userId2 = "user2" as RecordId;
    const userId3 = "user3" as RecordId;

    docRef.withTransaction(() => {
      void collection.set(userId1, { email: "alice@example.com", id: "user1", name: "Alice" });
      void collection.set(userId2, { email: "bob@example.com", id: "user2", name: "Bob" });
      void collection.set(userId3, { email: "charlie@example.com", id: "user3", name: "Charlie" });
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(stateChangeCount - initialCount).toBe(1);

    const record1 = collection.get(userId1)!;
    const record2 = collection.get(userId2)!;
    const record3 = collection.get(userId3)!;

    const snapshot1 = await record1.getSnapshot();
    const snapshot2 = await record2.getSnapshot();
    const snapshot3 = await record3.getSnapshot();

    expect(snapshot1).toEqual({ email: "alice@example.com", id: "user1", name: "Alice" });
    expect(snapshot2).toEqual({ email: "bob@example.com", id: "user2", name: "Bob" });
    expect(snapshot3).toEqual({ email: "charlie@example.com", id: "user3", name: "Charlie" });

    unsubscribe();
  });

  it("should batch mixed operations (set, update, delete) into single transaction", async () => {
    const collection = docRef.getRecords(schema.User);
    const stateModule = getStateModule(app);

    const userId1 = "user1" as RecordId;
    const userId2 = "user2" as RecordId;
    const userId3 = "user3" as RecordId;

    await collection.set(userId1, { email: "alice@example.com", id: "user1", name: "Alice" });
    await collection.set(userId2, { email: "bob@example.com", id: "user2", name: "Bob" });

    let stateChangeCount = 0;
    const unsubscribe = stateModule.onStateChange(docRef, () => {
      stateChangeCount++;
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    const initialCount = stateChangeCount;

    const record1 = collection.get(userId1)!;

    docRef.withTransaction(() => {
      void stateModule.updateRecord(record1, { name: "Alice Updated" });
      void collection.delete(userId2);
      void collection.set(userId3, { email: "charlie@example.com", id: "user3", name: "Charlie" });
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(stateChangeCount - initialCount).toBe(1);

    const snapshot1 = await record1.getSnapshot();
    expect(snapshot1.name).toBe("Alice Updated");

    const record3 = collection.get(userId3)!;
    const snapshot3 = await record3.getSnapshot();
    expect(snapshot3).toEqual({ email: "charlie@example.com", id: "user3", name: "Charlie" });

    unsubscribe();
  });

  it("should trigger collection callbacks once after transaction completes", async () => {
    const collection = docRef.getRecords(schema.User);
    const stateModule = getStateModule(app);

    const addedCallback = vi.fn();
    const unsubscribe = stateModule.onCollectionItemsAdded(collection, addedCallback);

    const userId1 = "user1" as RecordId;
    const userId2 = "user2" as RecordId;
    const userId3 = "user3" as RecordId;

    docRef.withTransaction(() => {
      void collection.set(userId1, { email: "alice@example.com", id: "user1", name: "Alice" });
      void collection.set(userId2, { email: "bob@example.com", id: "user2", name: "Bob" });
      void collection.set(userId3, { email: "charlie@example.com", id: "user3", name: "Charlie" });
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(addedCallback).toHaveBeenCalledTimes(1);
    const addedRecords = addedCallback.mock.calls[0]?.[0] as readonly RecordRef[] | undefined;
    expect(addedRecords).toBeDefined();
    expect(addedRecords).toHaveLength(3);

    unsubscribe();
  });

  it("should handle nested transactions correctly (Y.js transact is reentrant)", async () => {
    const collection = docRef.getRecords(schema.User);
    const stateModule = getStateModule(app);

    let stateChangeCount = 0;
    const unsubscribe = stateModule.onStateChange(docRef, () => {
      stateChangeCount++;
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    const initialCount = stateChangeCount;

    const userId1 = "user1" as RecordId;
    const userId2 = "user2" as RecordId;

    docRef.withTransaction(() => {
      void collection.set(userId1, { email: "alice@example.com", id: "user1", name: "Alice" });

      docRef.withTransaction(() => {
        void collection.set(userId2, { email: "bob@example.com", id: "user2", name: "Bob" });
      });
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(stateChangeCount - initialCount).toBe(1);

    const record1 = collection.get(userId1)!;
    const record2 = collection.get(userId2)!;

    const snapshot1 = await record1.getSnapshot();
    const snapshot2 = await record2.getSnapshot();

    expect(snapshot1).toEqual({ email: "alice@example.com", id: "user1", name: "Alice" });
    expect(snapshot2).toEqual({ email: "bob@example.com", id: "user2", name: "Bob" });

    unsubscribe();
  });

  it("should work correctly when operations are called without transaction", async () => {
    const collection = docRef.getRecords(schema.User);
    const stateModule = getStateModule(app);

    let stateChangeCount = 0;
    const unsubscribe = stateModule.onStateChange(docRef, () => {
      stateChangeCount++;
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    const initialCount = stateChangeCount;

    const userId1 = "user1" as RecordId;
    const userId2 = "user2" as RecordId;

    await collection.set(userId1, { email: "alice@example.com", id: "user1", name: "Alice" });
    await collection.set(userId2, { email: "bob@example.com", id: "user2", name: "Bob" });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(stateChangeCount - initialCount).toBe(2);

    const record1 = collection.get(userId1)!;
    const record2 = collection.get(userId2)!;

    const snapshot1 = await record1.getSnapshot();
    const snapshot2 = await record2.getSnapshot();

    expect(snapshot1).toEqual({ email: "alice@example.com", id: "user1", name: "Alice" });
    expect(snapshot2).toEqual({ email: "bob@example.com", id: "user2", name: "Bob" });

    unsubscribe();
  });

  it("should handle empty transaction", () => {
    let transactionRan = false;

    docRef.withTransaction(() => {
      transactionRan = true;
    });

    expect(transactionRan).toBe(true);
  });

  it("should pass description as origin to Y.js transaction", async () => {
    const collection = docRef.getRecords(schema.User);
    const documentService = app.getModule(DOCUMENT_SERVICE_MODULE_KEY);

    const userId1 = "user1" as RecordId;
    const userData = { email: "alice@example.com", id: "user1", name: "Alice" };

    const description = {
      data: userData,
      model: schema.User,
    };

    let capturedOrigin: unknown = undefined;

    const yDoc = (documentService as BaseYjsDocumentService)
      .getYDocForTesting(docRef.id);

    if (!yDoc) {
      throw new Error("Document not found");
    }

    const updateHandler = (_update: Uint8Array, origin: unknown, _doc: Y.Doc) => {
      capturedOrigin = origin;
    };

    yDoc.on("update", updateHandler);

    docRef.withTransaction(() => {
      void collection.set(userId1, userData);
    }, description);

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(capturedOrigin).toEqual(description);

    yDoc.off("update", updateHandler);
  });
});
