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
import * as Y from "yjs";
import { z } from "zod";
import { DOCUMENT_SERVICE_MODULE_KEY } from "../DocumentServiceModule.js";
import type { BaseYjsDocumentService } from "../service/BaseYjsDocumentService.js";
import { createDocRef } from "../types/DocumentRefImpl.js";
import { getStateModule } from "../types/StateModule.js";
import { createTestApp, createTestAppNoAutocreate } from "./testUtils.js";

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

const createTestSchema = (): DocumentSchema => ({
  [Metadata]: {
    version: 1,
  },
} as const satisfies DocumentSchema);

// Test data types
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

interface Address {
  street: string;
  city: string;
  zipCode: string;
}

const createSchemaWithRecords = () => {
  const userSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    age: z.number().int().positive(),
  });

  const addressSchema = z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string(),
  });

  const UserModel: Model<User, typeof userSchema> = {
    __type: {} as User,
    zodSchema: userSchema,
    [Metadata]: {
      name: "User",
    },
  };

  const AddressModel: Model<Address, typeof addressSchema> = {
    __type: {} as Address,
    zodSchema: addressSchema,
    [Metadata]: {
      name: "Address",
    },
  };

  return {
    User: UserModel,
    Address: AddressModel,
    [Metadata]: {
      version: 1,
    },
  } as const satisfies DocumentSchema;
};

describe("State Module Integration", () => {
  let app: PackAppInternal;
  beforeEach(() => {
    app = createTestAppNoAutocreate();
  });

  it("should initialize app with state module and create/load document", async () => {
    const stateModule = getStateModule(app);
    expect(stateModule).toBeDefined();

    const metadata: DocumentMetadata = {
      name: "Test Document",
      documentTypeName: "TestType",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const schema = createTestSchema();
    const docRef = await stateModule.createDocument(metadata, schema);

    expect(docRef).toBeDefined();
    expect(docRef.id).toBeDefined();
    expect(typeof docRef.id).toBe("string");

    let metadataCallbackCalled = false;
    let stateCallbackCalled = false;

    const unsubscribeMetadata = stateModule.onMetadataChange(
      docRef,
      (doc, receivedMetadata) => {
        expect(doc.id).toBe(docRef.id);
        expect(receivedMetadata.name).toBe("Test Document");
        metadataCallbackCalled = true;
      },
    );

    const unsubscribeState = stateModule.onStateChange(docRef, doc => {
      expect(doc.id).toBe(docRef.id);
      stateCallbackCalled = true;
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(metadataCallbackCalled).toBe(true);
    expect(stateCallbackCalled).toBe(true);

    unsubscribeMetadata();
    unsubscribeState();
  });

  it("should load via docRef", async () => {
    const stateModule = getStateModule(app);
    const metadata: DocumentMetadata = {
      name: "Persistent Document",
      documentTypeName: "TestType",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    // Create document and capture the ID, then discard the ref
    const schema = createTestSchema();
    const originalDocRef = await stateModule.createDocument(metadata, schema);
    const documentId = originalDocRef.id;

    // Create new docRef using the same ID and schema
    const newDocRef = createDocRef(app, documentId, schema);

    // Use the new docRef to load metadata via subscription
    let loadedMetadata: DocumentMetadata | null = null;
    let metadataLoadComplete = false;

    const unsubscribeMetadata = newDocRef.onMetadataChange(
      (doc, receivedMetadata) => {
        expect(doc.id).toBe(documentId);
        expect(receivedMetadata.name).toBe("Persistent Document");
        loadedMetadata = receivedMetadata;
        metadataLoadComplete = true;
      },
    );

    // Use the new docRef to subscribe to state changes
    let stateLoadComplete = false;
    const unsubscribeState = newDocRef.onStateChange(doc => {
      expect(doc.id).toBe(documentId);
      stateLoadComplete = true;
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(metadataLoadComplete).toBe(true);
    expect(stateLoadComplete).toBe(true);
    expect(loadedMetadata).toEqual(metadata);

    unsubscribeMetadata();
    unsubscribeState();
  });

  it("should set and get record values", async () => {
    const stateModule = getStateModule(app);
    const schema = createSchemaWithRecords();
    const metadata: DocumentMetadata = {
      name: "Document with Records",
      documentTypeName: "TestType",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const docRef = await stateModule.createDocument(metadata, schema);

    const userSchema = schema.User;
    const recordsCollection = docRef.getRecords(userSchema);

    const userId = "user_1" as RecordId;
    const userData = {
      id: "user_1",
      name: "John Doe",
      email: "john@example.com",
      age: 30,
    };

    // Set a record
    await recordsCollection.set(userId, userData);

    // Get the record back
    const recordRef = recordsCollection.get(userId);
    expect(recordRef).toBeDefined();

    if (recordRef) {
      const snapshot = await recordRef.getSnapshot();
      expect(snapshot).toEqual(userData);
    }
  });

  it("should trigger onStateChange when record is modified", async () => {
    const stateModule = getStateModule(app);
    const schema = createSchemaWithRecords();
    const metadata: DocumentMetadata = {
      name: "Document with State Changes",
      documentTypeName: "TestType",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const docRef = await stateModule.createDocument(metadata, schema);

    let stateChangeCount = 0;
    const unsubscribe = stateModule.onStateChange(docRef, () => {
      stateChangeCount++;
    });

    // Initial callback should fire immediately
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(stateChangeCount).toBe(1);

    const userSchema = schema.User;
    const recordsCollection = docRef.getRecords(userSchema);

    const userId = "user_1" as RecordId;
    const userData = {
      id: "user_1",
      name: "Jane Doe",
      email: "jane@example.com",
      age: 28,
    };

    // Setting a record should trigger state change
    await recordsCollection.set(userId, userData);

    // Verify the data was actually stored
    const recordRef = recordsCollection.get(userId);
    expect(recordRef).toBeDefined();
    const snapshot = await recordRef!.getSnapshot();
    expect(snapshot).toEqual(userData);

    // Wait for async callback
    await new Promise(resolve => setTimeout(resolve, 10));
    // Y.Doc may fire multiple events during record creation
    expect(stateChangeCount).toBeGreaterThanOrEqual(2);

    const countBeforeUpdate = stateChangeCount;

    // Update the record
    const updatedData = { ...userData, age: 29 };
    await recordsCollection.set(userId, updatedData);

    // Verify the update was stored
    const updatedSnapshot = await recordRef!.getSnapshot();
    expect(updatedSnapshot).toEqual(updatedData);
    expect(updatedSnapshot.age).toBe(29);

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(stateChangeCount).toBeGreaterThan(countBeforeUpdate);

    unsubscribe();
  });

  it("should handle multiple records and collections", async () => {
    const stateModule = getStateModule(app);
    const schema = createSchemaWithRecords();
    const metadata: DocumentMetadata = {
      name: "Multi-Record Document",
      documentTypeName: "TestType",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const docRef = await stateModule.createDocument(metadata, schema);

    const userSchema = schema.User;
    const addressSchema = schema.Address;

    const usersCollection = docRef.getRecords(userSchema);
    const addressesCollection = docRef.getRecords(addressSchema);

    // Add multiple users
    const user1Id = "user_1" as RecordId;
    const user2Id = "user_2" as RecordId;

    const user1Data = {
      id: "user_1",
      name: "Alice",
      email: "alice@example.com",
      age: 25,
    };

    const user2Data = {
      id: "user_2",
      name: "Bob",
      email: "bob@example.com",
      age: 32,
    };

    await usersCollection.set(user1Id, user1Data);
    await usersCollection.set(user2Id, user2Data);

    // Add an address
    const addressId = "addr_1" as RecordId;
    const addressData = {
      street: "123 Main St",
      city: "New York",
      zipCode: "10001",
    };
    await addressesCollection.set(addressId, addressData);

    // Verify collections maintain separate data
    expect(usersCollection.size).toBe(2);
    expect(addressesCollection.size).toBe(1);

    // Verify we can retrieve each user correctly
    const user1Ref = usersCollection.get(user1Id);
    const user2Ref = usersCollection.get(user2Id);
    expect(user1Ref).toBeDefined();
    expect(user2Ref).toBeDefined();

    const user1Snapshot = await user1Ref!.getSnapshot();
    const user2Snapshot = await user2Ref!.getSnapshot();
    expect(user1Snapshot).toEqual(user1Data);
    expect(user2Snapshot).toEqual(user2Data);

    // Verify address data
    const addressRef = addressesCollection.get(addressId);
    expect(addressRef).toBeDefined();
    const addressSnapshot = await addressRef!.getSnapshot();
    expect(addressSnapshot).toEqual(addressData);

    // Verify we can iterate over records
    const userIds: string[] = [];
    for (const recordRef of usersCollection) {
      userIds.push(recordRef.id as string);
      // Also verify each iterated record can be read
      const snapshot = await recordRef.getSnapshot();
      expect(snapshot).toBeDefined();
      expect(snapshot.id).toBeDefined();
    }
    expect(userIds).toContain("user_1");
    expect(userIds).toContain("user_2");
  });
});

describe("Lazy Document Creation", () => {
  let app: PackAppInternal;

  beforeEach(() => {
    app = createTestAppNoAutocreate();
  });

  it("should create document lazily when metadata subscription is made", async () => {
    const schema = createTestSchema();
    const documentId = "lazy-metadata-doc" as DocumentId;
    const testDocRef = createDocRef(app, documentId, schema);

    let callbackCalled = false;

    // Register metadata listener - this should create the document lazily
    const unsubscribe = testDocRef.onMetadataChange((doc, metadata) => {
      callbackCalled = true;
      expect(doc.id).toBe(documentId);
      // Initially no metadata since document was created lazily
      expect(metadata).toBeUndefined();
    });

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));

    // Callback should not be called since metadata is undefined
    expect(callbackCalled).toBe(false);

    // Verify the document was created internally (getDocSnapshot should work)
    const snapshot = await testDocRef.getDocSnapshot();
    expect(snapshot).toBeDefined();

    unsubscribe();
  });

  it("should create document lazily when state subscription is made", async () => {
    const schema = createTestSchema();
    const documentId = "lazy-state-doc" as DocumentId;
    const testDocRef = createDocRef(app, documentId, schema);

    let callbackCalled = false;

    // Register state listener - this should create the document lazily
    const unsubscribe = testDocRef.onStateChange(doc => {
      callbackCalled = true;
      expect(doc.id).toBe(documentId);
    });

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));

    // Callback should be called immediately
    expect(callbackCalled).toBe(true);

    // Verify the document was created internally
    const snapshot = await testDocRef.getDocSnapshot();
    expect(snapshot).toBeDefined();

    unsubscribe();
  });

  it("should create document lazily when collection subscription is made", async () => {
    const schema = createSchemaWithRecords();
    const documentId = "lazy-collection-doc" as DocumentId;
    const testDocRef = createDocRef(app, documentId, schema);

    const usersCollection = testDocRef.getRecords(schema.User);

    let addedCallbackCalled = false;
    let changedCallbackCalled = false;
    let deletedCallbackCalled = false;

    // Register collection listeners - these should create the document lazily
    const unsubscribeAdded = usersCollection.onItemsAdded(() => {
      addedCallbackCalled = true;
    });

    const unsubscribeChanged = usersCollection.onItemsChanged(() => {
      changedCallbackCalled = true;
    });

    const unsubscribeDeleted = usersCollection.onItemsDeleted(() => {
      deletedCallbackCalled = true;
    });

    // Verify the document was created internally
    const snapshot = await testDocRef.getDocSnapshot();
    expect(snapshot).toBeDefined();

    // Add a record to test the subscriptions work
    const userId = "user_1" as RecordId;
    const userData = {
      id: "user_1",
      name: "John Doe",
      email: "john@example.com",
      age: 30,
    };

    await usersCollection.set(userId, userData);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(addedCallbackCalled).toBe(true);

    // Update the record
    await usersCollection.set(userId, { ...userData, age: 31 });
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(changedCallbackCalled).toBe(true);

    // Delete the record
    await usersCollection.delete(userId);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(deletedCallbackCalled).toBe(true);

    unsubscribeAdded();
    unsubscribeChanged();
    unsubscribeDeleted();
  });

  it("should create document lazily when record subscription is made", async () => {
    const schema = createSchemaWithRecords();
    const documentId = "lazy-record-doc" as DocumentId;
    const testDocRef = createDocRef(app, documentId, schema);

    const usersCollection = testDocRef.getRecords(schema.User);
    const userId = "user_1" as RecordId;
    const userRecord = usersCollection.get(userId);

    // This should return undefined since record doesn't exist yet
    expect(userRecord).toBeUndefined();

    // Create a record ref directly using the recordRef function
    const stateModule = getStateModule(app);
    const directRecordRef = stateModule.createRecordRef(testDocRef, userId, schema.User);

    let changedCallbackCalled = false;
    let deletedCallbackCalled = false;

    // Register record listeners - these should create the document lazily
    const unsubscribeChanged = stateModule.onRecordChanged(directRecordRef, record => {
      changedCallbackCalled = true;
      expect(record.id).toBe(userId);
    });

    const unsubscribeDeleted = stateModule.onRecordDeleted(directRecordRef, record => {
      deletedCallbackCalled = true;
      expect(record.id).toBe(userId);
    });

    // Verify the document was created internally
    const snapshot = await testDocRef.getDocSnapshot();
    expect(snapshot).toBeDefined();

    // Add a record to test the subscriptions work
    const userData = {
      id: "user_1",
      name: "Jane Doe",
      email: "jane@example.com",
      age: 25,
    };

    await stateModule.setRecord(directRecordRef, userData);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(changedCallbackCalled).toBe(true);

    // Delete the record
    await usersCollection.delete(userId);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(deletedCallbackCalled).toBe(true);

    unsubscribeChanged();
    unsubscribeDeleted();
  });

  it("should handle mixed subscription scenarios with lazy creation", async () => {
    const schema = createSchemaWithRecords();
    const documentId = "mixed-lazy-doc" as DocumentId;
    const testDocRef = createDocRef(app, documentId, schema);

    const usersCollection = testDocRef.getRecords(schema.User);
    const userId = "user_1" as RecordId;

    let stateChangeCount = 0;
    let collectionAddedCount = 0;
    let recordChangedCount = 0;

    // Subscribe to state changes first
    const unsubscribeState = testDocRef.onStateChange(() => {
      stateChangeCount++;
    });

    // Subscribe to collection changes
    const unsubscribeCollection = usersCollection.onItemsAdded(() => {
      collectionAddedCount++;
    });

    // Create record ref and subscribe to it using StateModule API
    const stateModule = getStateModule(app);
    const directRecordRef = stateModule.createRecordRef(testDocRef, userId, schema.User);
    const unsubscribeRecord = stateModule.onRecordChanged(directRecordRef, () => {
      recordChangedCount++;
    });

    // Wait for initial callbacks
    await new Promise(resolve => setTimeout(resolve, 10));

    // State change should be called immediately
    expect(stateChangeCount).toBe(1);

    // Verify the document was created internally
    const snapshot = await testDocRef.getDocSnapshot();
    expect(snapshot).toBeDefined();

    // Add a record - this should trigger multiple subscriptions
    const userData = {
      id: "user_1",
      name: "Mixed Test User",
      email: "mixed@example.com",
      age: 40,
    };

    await usersCollection.set(userId, userData);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));

    // All subscriptions should have been notified
    expect(stateChangeCount).toBeGreaterThan(1); // State change from record addition
    expect(collectionAddedCount).toBeGreaterThanOrEqual(1); // Collection item added (may be multiple events)
    expect(recordChangedCount).toBe(1); // Record changed

    unsubscribeState();
    unsubscribeCollection();
    unsubscribeRecord();
  });

  it("should preserve existing behavior when document already exists", async () => {
    const schema = createTestSchema();
    const metadata: DocumentMetadata = {
      name: "Pre-existing Document",
      documentTypeName: "TestType",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    // Create document normally first
    const stateModule = getStateModule(app);
    const docRef = await stateModule.createDocument(metadata, schema);

    let metadataCallbackCount = 0;
    let receivedMetadata: DocumentMetadata | null = null;

    // Subscribe to existing document - should get immediate callback with metadata
    const unsubscribe = docRef.onMetadataChange((doc, meta) => {
      metadataCallbackCount++;
      receivedMetadata = meta;
      expect(doc.id).toBe(docRef.id);
    });

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));

    // Should get immediate callback with existing metadata
    expect(metadataCallbackCount).toBe(1);
    expect(receivedMetadata).toEqual(metadata);

    unsubscribe();
  });

  it("should handle updateRecord with partial updates", async () => {
    const stateModule = getStateModule(app);
    const schema = createSchemaWithRecords();
    const metadata: DocumentMetadata = {
      name: "Update Record Test",
      documentTypeName: "TestType",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const docRef = await stateModule.createDocument(metadata, schema);
    const usersCollection = docRef.getRecords(schema.User);

    const userId = "user_1" as RecordId;
    const initialData = {
      id: "user_1",
      name: "John Doe",
      email: "john@example.com",
      age: 30,
    };

    // Set initial record
    await usersCollection.set(userId, initialData);

    const recordRef = usersCollection.get(userId)!;
    let changeNotifications = 0;
    let lastSnapshot: User | null = null;

    // Subscribe to record changes
    const unsubscribe = stateModule.onRecordChanged(recordRef, snapshot => {
      changeNotifications++;
      lastSnapshot = snapshot;
    });

    // Wait for initial callback
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(changeNotifications).toBe(1);
    expect(lastSnapshot).toEqual(initialData);

    // Update only age using updateRecord
    await stateModule.updateRecord(recordRef, { age: 31 });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(changeNotifications).toBe(2);
    expect(lastSnapshot).toEqual({
      id: "user_1",
      name: "John Doe", // Should remain unchanged
      email: "john@example.com", // Should remain unchanged
      age: 31, // Should be updated
    });

    // Update multiple fields
    await stateModule.updateRecord(recordRef, { name: "Jane Doe", age: 32 });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(changeNotifications).toBe(3);
    expect(lastSnapshot).toEqual({
      id: "user_1",
      name: "Jane Doe", // Updated
      email: "john@example.com", // Unchanged
      age: 32, // Updated
    });

    // Verify final snapshot via direct get
    const finalSnapshot = await recordRef.getSnapshot();
    expect(finalSnapshot).toEqual(lastSnapshot);

    unsubscribe();
  });

  it("should handle updateRecord on non-existent record", async () => {
    const stateModule = getStateModule(app);
    const schema = createSchemaWithRecords();
    const metadata: DocumentMetadata = {
      name: "Update Non-Existent Record Test",
      documentTypeName: "TestType",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const docRef = await stateModule.createDocument(metadata, schema);

    const userId = "non_existent_user" as RecordId;
    const nonExistentRecord = stateModule.createRecordRef(docRef, userId, schema.User);

    // Try to update non-existent record - should reject
    await expect(stateModule.updateRecord(nonExistentRecord, { age: 25 }))
      .rejects.toThrow("Record not found for update");
  });

  it("should handle deleteRecord method", async () => {
    const stateModule = getStateModule(app);
    const schema = createSchemaWithRecords();
    const metadata: DocumentMetadata = {
      name: "Delete Record Test",
      documentTypeName: "TestType",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const docRef = await stateModule.createDocument(metadata, schema);
    const usersCollection = docRef.getRecords(schema.User);

    const userId = "user_to_delete" as RecordId;
    const userData = {
      id: "user_to_delete",
      name: "Delete Me",
      email: "delete@example.com",
      age: 25,
    };

    // Create record
    await usersCollection.set(userId, userData);
    expect(usersCollection.has(userId)).toBe(true);
    expect(usersCollection.size).toBe(1);

    // Get record ref and delete it
    const recordRef = usersCollection.get(userId)!;
    let deletedCallbackCalled = false;

    const unsubscribe = stateModule.onRecordDeleted(recordRef, deletedRecord => {
      deletedCallbackCalled = true;
      expect(deletedRecord.id).toBe(userId);
    });

    // Delete using StateModule deleteRecord method
    await stateModule.deleteRecord(recordRef);

    // Verify deletion
    expect(usersCollection.has(userId)).toBe(false);
    expect(usersCollection.size).toBe(0);
    expect(usersCollection.get(userId)).toBeUndefined();

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(deletedCallbackCalled).toBe(true);

    // Try to delete again - should be a no-op (no error)
    await stateModule.deleteRecord(recordRef);

    unsubscribe();
  });

  it("should handle setRecord as full replacement (clearing missing fields)", async () => {
    const stateModule = getStateModule(app);

    // Use a schema with optional fields to test field removal
    const userWithOptionalFields = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().optional(),
      age: z.number().optional(),
      bio: z.string().optional(),
    });

    type UserWithOptional = z.infer<typeof userWithOptionalFields>;

    const UserOptionalModel: Model<UserWithOptional, typeof userWithOptionalFields> = {
      __type: {} as UserWithOptional,
      zodSchema: userWithOptionalFields,
      [Metadata]: {
        name: "UserOptional",
      },
    };

    const schema = {
      UserOptional: UserOptionalModel,
      [Metadata]: { version: 1 },
    } as const satisfies DocumentSchema;

    const metadata: DocumentMetadata = {
      name: "Full Replacement Test",
      documentTypeName: "TestType",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const docRef = await stateModule.createDocument(metadata, schema);
    const usersCollection = docRef.getRecords(schema.UserOptional);

    const userId = "user_replace" as RecordId;
    const initialData: UserWithOptional = {
      id: "user_replace",
      name: "John Doe",
      email: "john@example.com",
      age: 30,
      bio: "Software Engineer",
    };

    // Set initial record with all fields
    await usersCollection.set(userId, initialData);

    let snapshot = await usersCollection.get(userId)!.getSnapshot();
    expect(snapshot).toEqual(initialData);

    // Replace with record missing some fields - setRecord should clear missing fields
    const replacementData: UserWithOptional = {
      id: "user_replace",
      name: "Jane Doe", // Changed
      email: "jane@example.com", // Changed
      // age and bio are missing - should be cleared by setRecord
    };

    await usersCollection.set(userId, replacementData);

    snapshot = await usersCollection.get(userId)!.getSnapshot();
    expect(snapshot).toEqual({
      id: "user_replace",
      name: "Jane Doe",
      email: "jane@example.com",
      // age and bio should be undefined/missing
    });
    expect(snapshot.age).toBeUndefined();
    expect(snapshot.bio).toBeUndefined();
  });
});

describe("InMemoryDocumentService with autoCreateDocuments", () => {
  let app: PackAppInternal;

  beforeEach(() => {
    app = createTestApp();
  });

  it("should auto-create document when metadata listener is registered for non-existent document", async () => {
    const schema = createTestSchema();

    // Create a document reference but don't create the actual document
    const documentId = "auto-created-doc" as DocumentId;
    const testDocRef = createDocRef(app, documentId, schema);

    let callbackCalled = false;

    // Register metadata listener - document should be created but callback should NOT be called
    // since autoCreateDocuments is enabled but no metadata is set initially
    const unsubscribe = testDocRef.onMetadataChange((doc, metadata) => {
      callbackCalled = true;
      expect(doc.id).toBe(documentId);
      expect(metadata).toBeDefined(); // If callback is called, metadata should exist
    });

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));

    // With the new base implementation, callback is not called unless metadata exists
    expect(callbackCalled).toBe(false);

    // But the document should still be created internally
    const snapshot = await testDocRef.getDocSnapshot();
    expect(snapshot).toBeDefined();

    // Now actually create the document with metadata to trigger the callback
    const stateModule = getStateModule(app);
    const metadata: DocumentMetadata = {
      name: "Auto-created document",
      documentTypeName: "auto-generated",
      ontologyRid: "auto-ontology",
      security: {
        discretionary: {
          owners: [{
            "type": "userId",
            "userId": "system",
          }],
        },
        mandatory: {},
      },
    };

    // Create document properly which should trigger metadata callback
    const docRef2 = await stateModule.createDocument(metadata, schema);

    // Register listener on properly created document
    let callbackCalled2 = false;
    let metadataReceived2: DocumentMetadata | null = null;

    const unsubscribe2 = docRef2.onMetadataChange((doc, meta) => {
      callbackCalled2 = true;
      metadataReceived2 = meta;
      expect(doc.id).toBe(docRef2.id);
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(callbackCalled2).toBe(true);
    expect(metadataReceived2).toBeDefined();
    expect(metadataReceived2!.name).toBe("Auto-created document");

    unsubscribe();
    unsubscribe2();
  });

  it("should not auto-create document when autoCreateDocuments is disabled", async () => {
    // Create a new app with autoCreateDocuments disabled
    const appWithoutAutoCreate = createTestAppNoAutocreate();

    const schema = createTestSchema();

    const documentId = "non-auto-created-doc" as DocumentId;
    const testDocRef = createDocRef(appWithoutAutoCreate, documentId, schema);

    let callbackCalled = false;

    // Register metadata listener - this should NOT trigger auto-creation
    const unsubscribe = testDocRef.onMetadataChange(() => {
      callbackCalled = true;
    });

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));

    // Callback should not be called because document doesn't exist
    expect(callbackCalled).toBe(false);

    unsubscribe();
  });

  it("should receive Y.js updates via record subscription without collection subscription", async () => {
    const schema = createSchemaWithRecords();
    const documentId = "yjs-update-test-doc" as DocumentId;
    const testDocRef = createDocRef(app, documentId, schema);
    const stateModule = getStateModule(app);

    const userId = "user-yjs-test" as RecordId;
    const userRecord = stateModule.createRecordRef(testDocRef, userId, schema.User);

    let changeCallbackCount = 0;
    let lastReceivedData: User | null = null;

    const unsubscribe = userRecord.onChange(data => {
      changeCallbackCount++;
      lastReceivedData = data;
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(changeCallbackCount).toBe(0);

    const userData: User = {
      id: userId,
      name: "Test User",
      email: "test@example.com",
      age: 30,
    };

    await userRecord.set(userData);
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(changeCallbackCount).toBe(1);
    expect(lastReceivedData).toMatchObject(userData);

    const updatedData: User = {
      ...userData,
      age: 31,
    };

    await userRecord.set(updatedData);
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(changeCallbackCount).toBe(2);
    expect(lastReceivedData).toMatchObject(updatedData);
    expect((lastReceivedData as User | null)?.age).toBe(31);

    unsubscribe();
  });
});

describe("Remote Y.js Updates", () => {
  let app: PackAppInternal;

  beforeEach(() => {
    app = createTestApp();
  });

  function simulateRemoteUpdate(
    app: PackAppInternal,
    documentId: DocumentId,
    updateFn: (yDoc: Y.Doc) => void,
  ) {
    const docService = app.getModule(DOCUMENT_SERVICE_MODULE_KEY);
    const yDoc = (docService as BaseYjsDocumentService).getYDocForTesting(documentId);
    if (!yDoc) {
      throw new Error("Y.Doc not found for document ID: " + documentId);
    }
    yDoc.transact(() => {
      updateFn(yDoc);
    }, "remote");
  }

  it("should handle remote record property updates", async () => {
    const schema = createSchemaWithRecords();
    const documentId = "remote-update-doc" as DocumentId;
    const testDocRef = createDocRef(app, documentId, schema);
    const stateModule = getStateModule(app);

    const userId = "user-1" as RecordId;
    const userRecord = stateModule.createRecordRef(testDocRef, userId, schema.User);

    await userRecord.set({
      id: userId,
      name: "Alice",
      email: "alice@example.com",
      age: 25,
    });

    let changeCount = 0;
    let lastAge: number | undefined;

    const unsubscribe = userRecord.onChange(data => {
      changeCount++;
      lastAge = data.age;
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(changeCount).toBe(1);
    expect(lastAge).toBe(25);

    simulateRemoteUpdate(app, documentId, yDoc => {
      const collection = yDoc.getMap("User");
      const record = collection.get(userId) as Y.Map<unknown>;
      record.set("age", 26);
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(changeCount).toBe(2);
    expect(lastAge).toBe(26);

    unsubscribe();
  });

  it("should handle remote record additions", async () => {
    const schema = createSchemaWithRecords();
    const documentId = "remote-add-doc" as DocumentId;
    const testDocRef = createDocRef(app, documentId, schema);

    const usersCollection = testDocRef.getRecords(schema.User);

    let addedCount = 0;
    const unsubscribe = usersCollection.onItemsAdded(records => {
      addedCount += records.length;
    });

    const userId = "user-remote" as RecordId;
    simulateRemoteUpdate(app, documentId, yDoc => {
      const collection = yDoc.getMap("User");
      const record = new Y.Map();
      record.set("id", userId);
      record.set("name", "Bob");
      record.set("email", "bob@example.com");
      record.set("age", 30);
      collection.set(userId, record);
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(addedCount).toBe(1);

    unsubscribe();
  });

  it("should handle remote record deletions", async () => {
    const schema = createSchemaWithRecords();
    const documentId = "remote-delete-doc" as DocumentId;
    const testDocRef = createDocRef(app, documentId, schema);
    const stateModule = getStateModule(app);

    const userId = "user-to-delete" as RecordId;
    const userRecord = stateModule.createRecordRef(testDocRef, userId, schema.User);

    await userRecord.set({
      id: userId,
      name: "Charlie",
      email: "charlie@example.com",
      age: 28,
    });

    const usersCollection = testDocRef.getRecords(schema.User);

    let deletedCount = 0;
    const unsubscribe = usersCollection.onItemsDeleted(records => {
      deletedCount += records.length;
    });

    simulateRemoteUpdate(app, documentId, yDoc => {
      const collection = yDoc.getMap("User");
      collection.delete(userId);
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(deletedCount).toBe(1);

    unsubscribe();
  });

  it("should handle multiple property updates in single transaction", async () => {
    const schema = createSchemaWithRecords();
    const documentId = "multi-prop-doc" as DocumentId;
    const testDocRef = createDocRef(app, documentId, schema);
    const stateModule = getStateModule(app);

    const userId = "user-multi" as RecordId;
    const userRecord = stateModule.createRecordRef(testDocRef, userId, schema.User);

    await userRecord.set({
      id: userId,
      name: "Diana",
      email: "diana@example.com",
      age: 32,
    });

    let changeCount = 0;

    const unsubscribe = userRecord.onChange(() => {
      changeCount++;
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(changeCount).toBe(1);

    simulateRemoteUpdate(app, documentId, yDoc => {
      const collection = yDoc.getMap("User");
      const record = collection.get(userId) as Y.Map<unknown>;
      record.set("name", "Diana Updated");
      record.set("age", 33);
      record.set("email", "diana.updated@example.com");
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(changeCount).toBe(2);

    unsubscribe();
  });
});
