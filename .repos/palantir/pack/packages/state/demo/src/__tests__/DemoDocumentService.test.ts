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

import type { Logger } from "@osdk/api";
import type { Client } from "@osdk/client";
import type { AppConfig, ModuleKey, PackAppInternal } from "@palantir/pack.core";
import type {
  ActivityEvent,
  DocumentMetadata,
  DocumentSchema,
  Model,
  PresenceEvent,
} from "@palantir/pack.document-schema.model-types";
import { getMetadata, Metadata } from "@palantir/pack.document-schema.model-types";
import { DocumentLiveStatus, DocumentLoadStatus, getStateModule } from "@palantir/pack.state.core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createDemoDocumentServiceConfig } from "../index.js";

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

const TEST_DB_PREFIX = `test-${Date.now()}`;

function createTestApp(
  config: Partial<AppConfig & { moduleConfigs: Record<symbol, unknown> }> = {},
): PackAppInternal {
  const modules = new Map<symbol, unknown>();

  const docConfig = createDemoDocumentServiceConfig({ dbPrefix: TEST_DB_PREFIX });
  const allModuleConfigs = {
    [docConfig[0].key]: docConfig[1],
    ...config.moduleConfigs,
  };

  const osdkClient = {
    ontologyRid: "ri.ontology...test",
  } as unknown as Client;

  const app: PackAppInternal = {
    config: {
      app: {
        appId: "test-app-id",
        ...config.app,
      },
      isDemoMode: config.isDemoMode ?? true,
      logger: config.logger ?? consoleLogger({}),
      ontologyRid: Promise.resolve("ri.ontology...test"),
      osdkClient,
      remote: {
        baseUrl: "http://localhost",
        fetchFn: fetch,
        packWsPath: "/api/v2/packSubscriptions",
        ...config.remote,
      },
    } satisfies AppConfig,
    getModule: <T, TConfig>(moduleKey: ModuleKey<T, TConfig>): T => {
      if (modules.has(moduleKey.key)) {
        return modules.get(moduleKey.key) as T;
      }

      const moduleConfig = allModuleConfigs[moduleKey.key] as TConfig;
      const instance = moduleKey.initModule(app, moduleConfig);
      modules.set(moduleKey.key, instance);

      if (moduleKey.appMemberName != null) {
        Object.defineProperty(app, moduleKey.appMemberName, {
          configurable: false,
          enumerable: true,
          get: () => instance,
        });
      }
      return instance;
    },
  };
  return app;
}

function consoleLogger(
  _bindings: Record<string, unknown>,
  _options?: { level?: string; msgPrefix?: string },
): Logger {
  return {
    child: consoleLogger,
    debug: console.debug,
    error: console.error,
    fatal: console.error,
    info: console.info,
    isLevelEnabled: () => true,
    trace: console.debug,
    warn: console.warn,
  } satisfies Logger;
}

const createTestSchema = (): DocumentSchema => ({
  [Metadata]: {
    version: 1,
  },
} as const satisfies DocumentSchema);

interface User {
  age: number;
  email: string;
  id: string;
  name: string;
}

const createSchemaWithRecords = () => {
  const userSchema = z.object({
    age: z.number().int().positive(),
    email: z.email(),
    id: z.string(),
    name: z.string(),
  });

  const UserModel: Model<User, typeof userSchema> = {
    __type: {} as User,
    [Metadata]: {
      name: "User",
    },
    zodSchema: userSchema,
  };

  return {
    [Metadata]: {
      version: 1,
    },
    User: UserModel,
  } as const satisfies DocumentSchema;
};

describe("DemoDocumentService", () => {
  let app: PackAppInternal;

  beforeEach(() => {
    app = createTestApp();
  });

  afterEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  it("should create and load a document", async () => {
    const stateModule = getStateModule(app);

    const metadata: DocumentMetadata = {
      documentTypeName: "TestType",
      name: "Test Document",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const schema = createTestSchema();
    const docRef = await stateModule.createDocument(metadata, schema);

    expect(docRef).toBeDefined();
    expect(docRef.id).toBeDefined();
    expect(typeof docRef.id).toBe("string");
  });

  it("should persist document and load it across service instances", async () => {
    const stateModule1 = getStateModule(app);

    const metadata: DocumentMetadata = {
      documentTypeName: "TestType",
      name: "Persistent Document",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const schema = createSchemaWithRecords();
    const docRef = await stateModule1.createDocument(metadata, schema);

    const userCollection = docRef.getRecords(schema.User);
    await userCollection.set("user1", {
      age: 30,
      email: "test@example.com",
      id: "user1",
      name: "Test User",
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    const app2 = createTestApp();
    const stateModule2 = getStateModule(app2);

    const foundDocs = await stateModule2.searchDocuments("TestType", schema);
    expect(foundDocs.data.length).toBeGreaterThan(0);

    const foundDoc = foundDocs.data.find(d => d.id === docRef.id);
    expect(foundDoc).toBeDefined();
    expect(foundDoc?.name).toBe("Persistent Document");
  });

  it("should handle document subscriptions and status changes", async () => {
    const stateModule = getStateModule(app);

    const metadata: DocumentMetadata = {
      documentTypeName: "TestType",
      name: "Status Test Document",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const schema = createTestSchema();
    const docRef = await stateModule.createDocument(metadata, schema);

    const statusUpdates: Array<{ data: any; metadata: any }> = [];

    const unsubscribe = stateModule.onStatusChange(docRef, (_, status) => {
      statusUpdates.push({
        data: { ...status.data },
        metadata: { ...status.metadata },
      });
    });

    const unsubscribeData = stateModule.onStateChange(docRef, () => {});

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(statusUpdates.length).toBeGreaterThan(0);
    const lastUpdate = statusUpdates[statusUpdates.length - 1];
    expect(lastUpdate).toBeDefined();
    expect(lastUpdate?.data.load).toBe(DocumentLoadStatus.LOADED);
    expect(lastUpdate?.data.live).toBe(DocumentLiveStatus.CONNECTED);

    unsubscribeData();
    unsubscribe();
  });

  it("should search documents by type", async () => {
    const stateModule = getStateModule(app);

    const metadata1: DocumentMetadata = {
      documentTypeName: "TypeA",
      name: "Doc A1",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const metadata2: DocumentMetadata = {
      documentTypeName: "TypeA",
      name: "Doc A2",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const metadata3: DocumentMetadata = {
      documentTypeName: "TypeB",
      name: "Doc B1",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const schema = createTestSchema();
    await stateModule.createDocument(metadata1, schema);
    await stateModule.createDocument(metadata2, schema);
    await stateModule.createDocument(metadata3, schema);

    const typeADocs = await stateModule.searchDocuments("TypeA", schema);
    expect(typeADocs.data.length).toBeGreaterThanOrEqual(2);

    const typeANames = typeADocs.data.map(doc => doc.name);
    expect(typeANames).toContain("Doc A1");
    expect(typeANames).toContain("Doc A2");
  });

  it("should handle presence events across multiple subscribers", async () => {
    const stateModule = getStateModule(app);

    const metadata: DocumentMetadata = {
      documentTypeName: "TestType",
      name: "Presence Test",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const schema = createTestSchema();
    const docRef = await stateModule.createDocument(metadata, schema);

    const presenceEvents: PresenceEvent[] = [];

    const unsubscribe1 = stateModule.onPresence(docRef, (_, event) => {
      presenceEvents.push(event);
    });

    const app2 = createTestApp();
    const stateModule2 = getStateModule(app2);
    const docRef2 = stateModule2.createDocRef(docRef.id, schema);

    const unsubscribe2 = stateModule2.onPresence(docRef2, () => {});

    await vi.waitFor(() => {
      expect(presenceEvents.length).toBeGreaterThan(0);
      const arriveEvents = presenceEvents.filter(e => e.eventData.type === "presenceArrived");
      expect(arriveEvents.length).toBeGreaterThan(0);
    }, { timeout: 10000 });

    unsubscribe1();
    unsubscribe2();
  });

  it("should handle activity events", async () => {
    const stateModule = getStateModule(app);

    const metadata: DocumentMetadata = {
      documentTypeName: "TestType",
      name: "Activity Test",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const schema = createSchemaWithRecords();
    const docRef = await stateModule.createDocument(metadata, schema);

    const activityEvents: ActivityEvent[] = [];

    const app2 = createTestApp();
    const stateModule2 = getStateModule(app2);
    const docRef2 = stateModule2.createDocRef(docRef.id, schema);

    const unsubscribe = stateModule2.onActivity(docRef2, (_, event) => {
      activityEvents.push(event);
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    const userCollection = docRef.getRecords(schema.User);
    void docRef.withTransaction(() => {
      return userCollection.set("activity-user", {
        age: 25,
        email: "activity@example.com",
        id: "activity-user",
        name: "Activity User",
      });
    }, {
      data: {
        age: 25,
        email: "activity@example.com",
        id: "activity-user",
        name: "Activity User",
      },
      model: schema.User,
    });

    await vi.waitFor(() => {
      expect(activityEvents.length).toBeGreaterThan(0);
    }, { timeout: 1000 });

    const firstEvent = activityEvents[0];
    expect(firstEvent).toBeDefined();
    if (firstEvent?.eventData.type === "customEvent") {
      expect(getMetadata(firstEvent.eventData.model).name).toBe("User");
    }

    unsubscribe();
  });

  it("should handle record operations", async () => {
    const stateModule = getStateModule(app);

    const metadata: DocumentMetadata = {
      documentTypeName: "TestType",
      name: "Record Test",
      ontologyRid: "test-ontology-rid",
      security: TEST_SECURITY,
    };

    const schema = createSchemaWithRecords();
    const docRef = await stateModule.createDocument(metadata, schema);

    const unsubscribeState = stateModule.onStateChange(docRef, () => {});
    await new Promise(resolve => setTimeout(resolve, 100));

    const userCollection = docRef.getRecords(schema.User);

    await userCollection.set("user1", {
      age: 30,
      email: "user1@example.com",
      id: "user1",
      name: "User One",
    });

    const userRef = userCollection.get("user1");
    expect(userRef).toBeDefined();
    const userData = await userRef?.getSnapshot();
    expect(userData?.name).toBe("User One");
    expect(userData?.age).toBe(30);

    unsubscribeState();
  });
});
