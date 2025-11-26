import { clientEnv } from "@beep/core-env/client";
import { KnowledgeManagementApi } from "@beep/knowledge-management-infra";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import { AtomHttpApi } from "@effect-atom/atom-react";

export class KnowledgeManagementClient extends AtomHttpApi.Tag<KnowledgeManagementClient>()(
  "KnowledgeManagementClient",
  {
    api: KnowledgeManagementApi.Api,
    httpClient: FetchHttpClient.layer,
    baseUrl: clientEnv.authUrl,
  }
) {}
