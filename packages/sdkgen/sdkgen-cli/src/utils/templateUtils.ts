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

import type { TemplateUtils } from "../types/index.js";

export function createTemplateUtils(): TemplateUtils {
  return {
    camelCase: (str: string) => {
      // First handle all caps with underscores (like HELLO_WORLD)
      if (str === str.toUpperCase() && str.includes("_")) {
        return str
          .toLowerCase()
          .replace(/_(.)/g, (_, c: string) => c.toUpperCase());
      }

      // Handle PascalCase by inserting spaces before capitals, and replace underscores with spaces
      const withSpaces = str
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/([A-Z])/g, " $1") // Insert spaces before capitals
        .trim();
      // Now convert to camelCase
      return withSpaces
        .toLowerCase()
        .replace(/[-_\s]+(.)?/g, (_, c: string | undefined) => c ? c.toUpperCase() : "")
        .replace(/^(.)/, c => c.toLowerCase());
    },

    pascalCase: (str: string) => {
      return str
        .replace(/[-_\s]+(.)?/g, (_, c: string | undefined) => c ? c.toUpperCase() : "")
        .replace(/^(.)/, c => c.toUpperCase());
    },

    kebabCase: (str: string) => {
      return str
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .toLowerCase();
    },

    snakeCase: (str: string) => {
      return str
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/[\s-]+/g, "_")
        .toLowerCase();
    },

    pluralize: (str: string) => {
      if (str.match(/s$/)) return str;
      /* cspell:disable-next-line */
      if (str.match(/[^aeiou]y$/)) return str.replace(/y$/, "ies");
      if (str.match(/(s|x|z|ch|sh)$/)) return str + "es";
      return str + "s";
    },

    singularize: (str: string) => {
      if (str.match(/ies$/)) return str.replace(/ies$/, "y");
      if (str.match(/ses$/)) return str.replace(/es$/, "");
      if (str.match(/s$/)) return str.replace(/s$/, "");
      return str;
    },

    capitalize: (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    lower: (str: string) => str.toLowerCase(),

    upper: (str: string) => str.toUpperCase(),
  };
}
