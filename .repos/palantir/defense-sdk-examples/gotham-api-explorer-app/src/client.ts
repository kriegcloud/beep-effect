/*
 * (c) Copyright 2025 Palantir Technologies Inc. All rights reserved.
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
import { Client, createClient } from "@osdk/client";
import { $ontologyRid } from "@gotham-api-explorer-app/sdk";
import { createPublicOauthClient } from "@osdk/oauth";

const url = import.meta.env.VITE_FOUNDRY_API_URL;
const clientId = import.meta.env.VITE_FOUNDRY_CLIENT_ID;
const redirectUrl = import.meta.env.VITE_FOUNDRY_REDIRECT_URL;

checkEnv(url, "VITE_FOUNDRY_API_URL");
checkEnv(clientId, "VITE_FOUNDRY_CLIENT_ID");
checkEnv(redirectUrl, "VITE_FOUNDRY_REDIRECT_URL");
const scopes = [
	"api:use-ontologies-read",
	"api:use-ontologies-write",
	"api:use-admin-read",
	"api:use-admin-write",
	"api:use-datasets-read",
	"api:use-datasets-write",
	"api:use-filesystem-read",
	"api:use-filesystem-write",
	"api:use-map-read",
	"api:use-map-write",
	"api:use-target-read",
	"api:use-target-write",
	"api:use-geotime-read",
	"api:use-geotime-write"
]

function checkEnv(
  value: string | undefined,
  name: string,
): asserts value is string {
  if (value == null) {
    throw new Error(`Missing environment variable: ${name}`);
  }
}

export const auth = createPublicOauthClient(
  clientId,
  url,
  redirectUrl,
  true, 
  undefined, 
  window.location.toString(), 
  scopes
  )

// console.log("token: " + (await auth.refresh())?.access_token);

/**
 * Initialize the client to interact with the Ontology SDK
 */
const client: Client = createClient(
  url,
  $ontologyRid,
  auth,
);

export default client;
