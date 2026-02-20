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
import { loadEnv } from "vite";
import { expect, test } from "vitest";

const ENV_VARS = [
  "VITE_FOUNDRY_API_URL",
  "VITE_FOUNDRY_CLIENT_ID",
  "VITE_FOUNDRY_REDIRECT_URL",
];

for (const envVar of ENV_VARS) {
  test.skipIf(process.env.VERIFY_ENV_PRODUCTION !== "true")(
    `production env should contain ${envVar}`,
    () => {
      const env = loadEnv("production", process.cwd());
      expect(env[envVar], `${envVar} should be defined`).toBeDefined();
      expect(
        env[envVar],
        `${envVar} should not contain placeholder value`,
      ).not.toMatch(/<.*>/);
    },
  );
}
