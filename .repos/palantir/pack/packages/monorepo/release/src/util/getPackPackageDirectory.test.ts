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

import { describe, expect, it } from "vitest";
import { getPackPackageDirectory } from "./getPackPackageDirectory.js";

describe("getPackPackageDirectory", () => {
  it("should return directory for nested package structure", async () => {
    const result = await getPackPackageDirectory("@palantir/pack.monorepo.release");

    expect(result).toBe("packages/monorepo/release");
  });

  it("should return directory for deeply nested package structure", async () => {
    const result = await getPackPackageDirectory("@palantir/pack.document-schema.model-types");

    expect(result).toBe("packages/document-schema/model-types");
  });

  it("should use cached results on subsequent calls", async () => {
    const result1 = await getPackPackageDirectory("@palantir/pack.monorepo.release");
    const result2 = await getPackPackageDirectory("@palantir/pack.monorepo.release");

    expect(result1).toBe(result2);
    expect(result1).toBe("packages/monorepo/release");
  });

  it("should throw error for non-existent package", async () => {
    await expect(
      getPackPackageDirectory("@palantir/pack.does-not-exist"),
    ).rejects.toThrow("Package \"@palantir/pack.does-not-exist\" not found in workspace");
  });
});
