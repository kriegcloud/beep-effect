/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
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
import { parseUrl } from "./foundryPlatformFetch.js";

describe("test url parsers", () => {
  it("should work if trailing slash is not present", () => {
    const urlOnlyHostName = parseUrl(
      "https://example.domain.com",
      "/v2/ontologies/objectTypes/load",
    );

    expect(urlOnlyHostName.toString()).toEqual(
      "https://example.domain.com/api/v2/ontologies/objectTypes/load",
    );

    const urlWithLongerEntryPoint = parseUrl(
      "https://example.domain.com/otherstuff/some/stuff",
      "/v2/ontologies/objectTypes/load",
    );

    expect(urlWithLongerEntryPoint.toString()).toEqual(
      "https://example.domain.com/otherstuff/some/stuff/api/v2/ontologies/objectTypes/load",
    );
  });

  it("should work if trailing slash is present", () => {
    const urlOnlyHostName = parseUrl(
      "https://example.domain.com/",
      "/v2/ontologies/objectTypes/load",
    );

    expect(urlOnlyHostName.toString()).toEqual(
      "https://example.domain.com/api/v2/ontologies/objectTypes/load",
    );

    const urlWithLongerEntryAndSlash = parseUrl(
      "https://example.domain.com/otherstuff/some/stuff/",
      "/v2/ontologies/objectTypes/load",
    );

    expect(urlWithLongerEntryAndSlash.toString()).toEqual(
      "https://example.domain.com/otherstuff/some/stuff/api/v2/ontologies/objectTypes/load",
    );
  });
});
