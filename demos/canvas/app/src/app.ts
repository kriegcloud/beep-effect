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

import { createClient } from "@osdk/client";
import { BrowserLogger } from "@osdk/client/internal";
import type { PublicOauthClient } from "@osdk/oauth";
import { createPublicOauthClient } from "@osdk/oauth";
import {
  createDemoPublicOauthClient,
  getPageEnvOrThrow,
  initPackApp,
  isDemoEnv,
} from "@palantir/pack.app";

const ALLOW_DEV_TOKEN = true;

const SCOPES = [
  "api:use-admin-read",
  "api:use-admin-write",
  // remove filesystem scopes once filesystem perms are
  // supported in pack-read and pack-write
  "api:use-filesystem-read",
  "api:use-filesystem-write",
  "api:use-mediasets-read",
  "api:use-mediasets-write",
  "api:use-ontologies-read",
  "api:use-ontologies-write",
  "api:use-pack-read",
  "api:use-pack-write",
];

const logger = new BrowserLogger();
const pageEnv = getPageEnvOrThrow();

const CLIENT_ID = pageEnv.clientId;
const FOUNDRY_URL = pageEnv.baseUrl;
const ONTOLOGY_RID = pageEnv.ontologyRid;
const REDIRECT_URL = pageEnv.redirectUrl ?? `${FOUNDRY_URL}/auth/callback`;

export const DOCUMENT_TYPE_NAME = pageEnv.documentTypeName;
export const FILE_SYSTEM_TYPE = pageEnv.fileSystemType;
export const PARENT_FOLDER_RID = pageEnv.parentFolderRid;

function createAuthClient(): PublicOauthClient | (() => Promise<string>) {
  const DEV_TOKEN: string | undefined = import.meta.env.VITE_DEV_FOUNDRY_TOKEN;

  if (ALLOW_DEV_TOKEN && DEV_TOKEN != null) {
    logger.warn("Using VITE_DEV_FOUNDRY_TOKEN for auth");
    return () => Promise.resolve(DEV_TOKEN);
  }

  if (isDemoEnv()) {
    return createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL, {
      autoSignIn: true,
    });
  }

  return createPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL, {
    scopes: SCOPES,
  });
}

const authClient = createAuthClient();

const osdkClient = createClient(FOUNDRY_URL, ONTOLOGY_RID, authClient, {
  logger,
});

export const app = initPackApp(osdkClient, {
  app: pageEnv.appId != null
    ? {
      appId: pageEnv.appId,
      appVersion: pageEnv.appVersion ?? undefined,
    }
    : undefined,
  demoMode: isDemoEnv(),
  logLevel: "info",
  ontologyRid: ONTOLOGY_RID,
})
  .withState()
  .build();
