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
import { createClient } from "@osdk/client";
import { MinimalLogger } from "@osdk/client/internal";
import { createConfidentialOauthClient, createPublicOauthClient } from "@osdk/oauth";
import type { AppOptions } from "@palantir/pack.core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { initPackApp } from "../utils/initPackApp.js";

// Mock external dependencies
import { getPageEnv } from "../utils/getPageEnv.js";
vi.mock("../utils/getPageEnv.js");

vi.mock("../utils/getDocumentServiceConfig.js", () => ({
  getDocumentServiceConfig: vi.fn(() => [
    { key: Symbol.for("test-document-service") },
    {},
  ]),
}));

const TEST_FOUNDRY_URL = "https://test.palantir.com";
const TEST_FOUNDRY_URL_WITH_SLASH = "https://test.palantir.com/";
const TEST_CLIENT_ID = "test-client-id";
const TEST_REDIRECT_URL = "http://localhost:3000/auth/callback";
const TEST_ONTOLOGY_RID = "ri.ontology.main.ontology.test-ontology";
const TEST_CLIENT_SECRET = "test-client-secret";
const TEST_DOCUMENT_TYPE_NAME = "test-document-type";
const TEST_FILE_SYSTEM_TYPE = "ARTIFACTS";

const TEST_APP_CONFIG = Object.freeze({
  appId: "test-app",
  appVersion: "1.0.0",
});

const APP_CONFIG = Object.freeze({
  app: TEST_APP_CONFIG,
});

describe("initPackApp", () => {
  // Set up default mock return values
  beforeEach(() => {
    // Reset to default page env values for most tests
    vi.mocked(getPageEnv).mockReturnValue({
      appId: "page-env-app-id",
      appVersion: "1.0.0",
      baseUrl: "https://page-env.example.com",
      clientId: "page-env-client-id",
      demoMode: null,
      documentTypeName: TEST_DOCUMENT_TYPE_NAME,
      fileSystemType: TEST_FILE_SYSTEM_TYPE,
      ontologyRid: TEST_ONTOLOGY_RID,
      parentFolderRid: null,
      redirectUrl: "http://localhost:3000/page-env-callback",
    });
  });

  // Test utility functions
  function createTestPublicClient(options?: { logger?: Logger }): Client {
    const auth = createPublicOauthClient(
      TEST_CLIENT_ID,
      TEST_FOUNDRY_URL,
      TEST_REDIRECT_URL,
    );
    return createClient(TEST_FOUNDRY_URL, TEST_ONTOLOGY_RID, auth, options);
  }

  function createTestConfidentialClient(options?: { logger?: Logger }): Client {
    const auth = createConfidentialOauthClient(
      TEST_CLIENT_ID,
      TEST_CLIENT_SECRET,
      TEST_FOUNDRY_URL,
    );
    return createClient(TEST_FOUNDRY_URL, TEST_ONTOLOGY_RID, auth, options);
  }

  function createCustomTokenProvider(): () => Promise<string> {
    return vi.fn().mockResolvedValue("custom-token");
  }

  describe("with OSDK client", () => {
    it("should create app from public OSDK client", () => {
      const client = createTestPublicClient();
      const options = APP_CONFIG;

      const app = initPackApp(client, options);

      expect(app).toBeDefined();
      expect(app.config.app).toEqual(TEST_APP_CONFIG);
      expect(app.config.remote.baseUrl).toBe(TEST_FOUNDRY_URL_WITH_SLASH);
      expect(app.config.osdkClient).toBe(client);
    });

    it("should create app from confidential OSDK client", () => {
      const client = createTestConfidentialClient();
      const options = APP_CONFIG;

      const app = initPackApp(client, options);

      expect(app).toBeDefined();
      expect(app.config.app).toEqual(TEST_APP_CONFIG);
      expect(app.config.remote.baseUrl).toBe(TEST_FOUNDRY_URL_WITH_SLASH);
      expect(app.config.osdkClient).toBe(client);
    });

    it("should allow overriding auth with custom token provider", () => {
      const client = createTestPublicClient();
      const customTokenProvider = createCustomTokenProvider();
      const options: AppOptions = {
        ...APP_CONFIG,
        auth: customTokenProvider,
      };

      const app = initPackApp(client, options);

      expect(app).toBeDefined();
      expect(app.config.app).toEqual(TEST_APP_CONFIG);
      expect(app.auth).toBeDefined();
      expect(app.config.osdkClient).toBe(client);
    });

    it("should allow overriding baseUrl", () => {
      const client = createTestPublicClient();
      const customBaseUrl = "https://custom.example.com";
      const options: AppOptions = {
        ...APP_CONFIG,
        remote: {
          baseUrl: customBaseUrl,
        },
      };

      const app = initPackApp(client, options);

      expect(app).toBeDefined();
      expect(app.config.remote.baseUrl).toBe(customBaseUrl);
    });

    it("should use custom logger when provided", () => {
      const client = createTestPublicClient();
      const customLogger = new MinimalLogger({ level: "debug", msgPrefix: "[CustomLogger]" });
      const options: AppOptions = {
        ...APP_CONFIG,
        logger: customLogger,
      };

      const app = initPackApp(client, options);

      expect(app).toBeDefined();
      expect(app.config.logger).toBe(customLogger);
    });

    it("should extract logger from OSDK client if present", () => {
      const customLogger = new MinimalLogger({ level: "debug", msgPrefix: "[OSDK]" });
      const childSpy = vi.spyOn(customLogger, "child");

      const clientWithLogger = createTestPublicClient({ logger: customLogger });

      const options: AppOptions = APP_CONFIG;

      initPackApp(clientWithLogger, options);

      expect(childSpy).toHaveBeenCalledWith({}, { level: "warn", msgPrefix: "PACK" });
    });

    it("should use app config from page environment when not provided", () => {
      const client = createTestPublicClient();
      const options: AppOptions = {
        // No app config provided - should use page env
      };

      const app = initPackApp(client, options);

      expect(app.config.app.appId).toBe("page-env-app-id");
      expect(app.config.app.appVersion).toBe("1.0.0");
    });

    it("should override page environment app config when provided", () => {
      const client = createTestPublicClient();
      const options: AppOptions = {
        ...APP_CONFIG,
        app: {
          appId: "override-app-id",
          appVersion: "2.0.0",
        },
      };

      const app = initPackApp(client, options);

      expect(app.config.app.appId).toBe("override-app-id");
      expect(app.config.app.appVersion).toBe("2.0.0");
    });

    it("should throw error when no appId available", () => {
      vi.mocked(getPageEnv).mockReturnValue({
        appId: null,
        appVersion: null,
        baseUrl: "https://page-env.example.com",
        clientId: null,
        demoMode: null,
        documentTypeName: TEST_DOCUMENT_TYPE_NAME,
        fileSystemType: TEST_FILE_SYSTEM_TYPE,
        ontologyRid: TEST_ONTOLOGY_RID,
        parentFolderRid: null,
        redirectUrl: "http://localhost:3000/page-env-callback",
      });

      const client = createTestPublicClient();
      const options: AppOptions = {
        // No app config provided and page env has no appId
      };

      expect(() => {
        initPackApp(client, options);
      }).toThrow("No appId provided or present in document meta[pack-appId]");
    });
  });

  describe("ontologyRid configuration", () => {
    it("should use ontologyRid from page environment when not provided", async () => {
      const client = createTestPublicClient();
      const options: AppOptions = {
        app: TEST_APP_CONFIG,
      };

      const app = initPackApp(client, options);

      const ontologyRid = await app.config.ontologyRid;
      expect(ontologyRid).toBe(TEST_ONTOLOGY_RID);
    });

    it("should override page environment ontologyRid when provided in options", async () => {
      const client = createTestPublicClient();
      const overrideOntologyRid = "ri.ontology.main.ontology.override";
      const options: AppOptions = {
        app: TEST_APP_CONFIG,
        ontologyRid: overrideOntologyRid,
      };

      const app = initPackApp(client, options);

      const ontologyRid = await app.config.ontologyRid;
      expect(ontologyRid).toBe(overrideOntologyRid);
    });

    it("should reject promise when no ontologyRid in options and page env is null", async () => {
      vi.mocked(getPageEnv).mockReturnValue({
        appId: "page-env-app-id",
        appVersion: "1.0.0",
        baseUrl: "https://page-env.example.com",
        clientId: "page-env-client-id",
        demoMode: null,
        documentTypeName: TEST_DOCUMENT_TYPE_NAME,
        fileSystemType: TEST_FILE_SYSTEM_TYPE,
        ontologyRid: null,
        parentFolderRid: null,
        redirectUrl: "http://localhost:3000/page-env-callback",
      });

      const client = createTestPublicClient();
      const options: AppOptions = {
        app: TEST_APP_CONFIG,
      };

      const app = initPackApp(client, options);

      await expect(app.config.ontologyRid).rejects.toThrow(
        "No ontologyRid provided or present in document meta[osdk-ontologyRid]",
      );
    });

    it("should reject promise when page env is empty string", async () => {
      vi.mocked(getPageEnv).mockReturnValue({
        appId: "page-env-app-id",
        appVersion: "1.0.0",
        baseUrl: "https://page-env.example.com",
        clientId: "page-env-client-id",
        demoMode: null,
        documentTypeName: TEST_DOCUMENT_TYPE_NAME,
        fileSystemType: TEST_FILE_SYSTEM_TYPE,
        ontologyRid: "",
        parentFolderRid: null,
        redirectUrl: "http://localhost:3000/page-env-callback",
      });

      const client = createTestPublicClient();
      const options: AppOptions = {
        app: TEST_APP_CONFIG,
      };

      const app = initPackApp(client, options);

      await expect(app.config.ontologyRid).rejects.toThrow(
        "No ontologyRid provided or present in document meta[osdk-ontologyRid]",
      );
    });
  });
});
