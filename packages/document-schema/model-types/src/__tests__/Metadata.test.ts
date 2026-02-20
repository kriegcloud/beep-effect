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
import { getMetadata, Metadata, type WithMetadata } from "../types/Metadata.js";

describe("Metadata Lookup Tests", () => {
  it("should retrieve metadata using direct symbol access", () => {
    const obj: WithMetadata<{ name: string }> = {
      [Metadata]: { name: "TestModel" },
    };

    const result = getMetadata(obj);

    expect(result).toEqual({ name: "TestModel" });
  });

  it("should fallback to string-based symbol matching for cross-package scenarios", () => {
    // Simulate a different copy of the Metadata symbol (as if from a different package instance)
    const differentMetadataSymbol = Symbol("@palantir/pack.document-schema/metadata");

    const obj = {
      [differentMetadataSymbol]: { version: 2 },
    } as WithMetadata<{ version: number }>;

    const result = getMetadata(obj);

    expect(result).toEqual({ version: 2 });
  });
});
