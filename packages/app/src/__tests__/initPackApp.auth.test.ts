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

import type { Client } from "@osdk/client";
import { createClient } from "@osdk/client";
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
const TEST_CLIENT_ID = "test-client-id";
const TEST_REDIRECT_URL = "http://localhost:3000/auth/callback";
const TEST_ONTOLOGY_RID = "ri.ontology.main.ontology.test-ontology";
const TEST_CLIENT_SECRET = "test-client-secret";
const TEST_DOCUMENT_TYPE_NAME = "test-document-type";
const TEST_FILE_SYSTEM_TYPE = "ARTIFACTS";

describe("initPackApp - Auth Integration", () => {
  const TEST_APP_CONFIG = {
    appId: "test-app",
    appVersion: "1.0.0",
  };

  // Set up default mock return values
  beforeEach(() => {
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

  function createTestPublicClient(): Client {
    const auth = createPublicOauthClient(
      TEST_CLIENT_ID,
      TEST_FOUNDRY_URL,
      TEST_REDIRECT_URL,
    );
    return createClient(TEST_FOUNDRY_URL, TEST_ONTOLOGY_RID, auth);
  }

  function createTestConfidentialClient(): Client {
    const auth = createConfidentialOauthClient(
      TEST_CLIENT_ID,
      TEST_CLIENT_SECRET,
      TEST_FOUNDRY_URL,
    );
    return createClient(TEST_FOUNDRY_URL, TEST_ONTOLOGY_RID, auth);
  }

  function createCustomTokenProvider(): () => Promise<string> {
    return vi.fn().mockResolvedValue("custom-token");
  }

  describe("auth service integration", () => {
    it("should create auth service from public oauth client", () => {
      const client = createTestPublicClient();
      const options: AppOptions = {
        app: TEST_APP_CONFIG,
      };

      const app = initPackApp(client, options);

      expect(app.auth).toBeDefined();
    });

    it("should create auth service from confidential oauth client", () => {
      const client = createTestConfidentialClient();
      const options: AppOptions = {
        app: TEST_APP_CONFIG,
      };

      const app = initPackApp(client, options);

      expect(app.auth).toBeDefined();
    });

    it("should use custom token provider when provided", () => {
      const client = createTestPublicClient();
      const customTokenProvider = createCustomTokenProvider();
      const options: AppOptions = {
        app: TEST_APP_CONFIG,
        auth: customTokenProvider,
      };

      const app = initPackApp(client, options);

      expect(app.auth).toBeDefined();
    });

    it("should create auth service even with overridden baseUrl", () => {
      const client = createTestPublicClient();
      const customBaseUrl = "https://custom.example.com";
      const options: AppOptions = {
        app: TEST_APP_CONFIG,
        remote: {
          baseUrl: customBaseUrl,
        },
      };

      const app = initPackApp(client, options);

      expect(app.auth).toBeDefined();
      expect(app.config.remote.baseUrl).toBe(customBaseUrl);
    });
  });
});
