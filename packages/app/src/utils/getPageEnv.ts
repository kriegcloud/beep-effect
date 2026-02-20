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

export interface PageEnv {
  readonly appId: string | null;
  readonly appVersion: string | null;
  readonly baseUrl: string | null;
  readonly clientId: string | null;
  readonly demoMode: boolean | null;
  readonly documentTypeName: string | null;
  readonly fileSystemType: string | null;
  readonly ontologyRid: string | null;
  readonly parentFolderRid: string | null;
  readonly redirectUrl: string | null;
}

export interface RequiredPageEnv {
  readonly appId: string | null;
  readonly appVersion: string | null;
  readonly baseUrl: string;
  readonly clientId: string;
  readonly demoMode: boolean | null;
  readonly documentTypeName: string;
  readonly fileSystemType: string | null;
  readonly ontologyRid: string;
  readonly parentFolderRid: string | null;
  readonly redirectUrl: string | null;
}

export function getPageEnv(): PageEnv {
  const appId = getMetaTagContent("pack-appId");
  const appVersion = getMetaTagContent("pack-appVersion");
  const demoModeStr = getMetaTagContent("pack-demoMode");
  const documentTypeName = getMetaTagContent("pack-documentTypeName");
  const fileSystemType = getMetaTagContent("pack-fileSystemType");
  const foundryUrl = getMetaTagContent("osdk-foundryUrl");
  const parentFolderRid = getMetaTagContent("pack-parentFolderRid");
  const clientId = getMetaTagContent("osdk-clientId");
  const ontologyRid = getMetaTagContent("osdk-ontologyRid");
  const redirectUrl = getMetaTagContent("osdk-redirectUrl");

  const demoMode = demoModeStr === "true";

  return {
    appId,
    appVersion,
    baseUrl: foundryUrl,
    clientId,
    demoMode,
    documentTypeName,
    fileSystemType,
    ontologyRid,
    parentFolderRid,
    redirectUrl,
  };
}

export function getPageEnvOrThrow(): RequiredPageEnv {
  const env = getPageEnv();

  const missing: string[] = [];
  if (env.baseUrl == null) missing.push("osdk-foundryUrl");
  if (env.clientId == null) missing.push("osdk-clientId");
  if (env.documentTypeName == null) missing.push("pack-documentTypeName");
  if (env.ontologyRid == null) missing.push("osdk-ontologyRid");

  if (missing.length > 0) {
    throw new Error(
      `Missing required page environment meta tags: ${missing.join(", ")}. `
        + `Please ensure these are set in your index.html or via your build configuration.`,
    );
  }

  return {
    appId: env.appId,
    appVersion: env.appVersion,
    baseUrl: env.baseUrl!,
    clientId: env.clientId!,
    demoMode: env.demoMode,
    documentTypeName: env.documentTypeName!,
    fileSystemType: env.fileSystemType,
    ontologyRid: env.ontologyRid!,
    parentFolderRid: env.parentFolderRid,
    redirectUrl: env.redirectUrl,
  };
}

function getMetaTagContent(tagName: string): string | null {
  const elements = document.querySelectorAll(`meta[name="${tagName}"]`);
  const element = elements.item(elements.length - 1);

  const value = element?.getAttribute("content") ?? null;
  if (value?.match(/%.+%/)) {
    throw new Error(
      `Meta tag ${tagName} contains placeholder value. Please add ${
        value.replace(/%/g, "")
      } to your .env files`,
    );
  }
  return value;
}
