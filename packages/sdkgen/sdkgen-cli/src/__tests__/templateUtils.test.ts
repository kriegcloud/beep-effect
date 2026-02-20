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
import { createTemplateUtils } from "../utils/templateUtils.js";

describe("templateUtils", () => {
  const utils = createTemplateUtils();

  describe("camelCase", () => {
    it("should convert to camelCase", () => {
      expect(utils.camelCase("hello-world")).toBe("helloWorld");
      expect(utils.camelCase("hello_world")).toBe("helloWorld");
      expect(utils.camelCase("Hello World")).toBe("helloWorld");
      expect(utils.camelCase("HelloWorld")).toBe("helloWorld");
      expect(utils.camelCase("HELLO_WORLD")).toBe("helloWorld");
    });
  });

  describe("pascalCase", () => {
    it("should convert to PascalCase", () => {
      expect(utils.pascalCase("hello-world")).toBe("HelloWorld");
      expect(utils.pascalCase("hello_world")).toBe("HelloWorld");
      expect(utils.pascalCase("hello world")).toBe("HelloWorld");
      expect(utils.pascalCase("helloWorld")).toBe("HelloWorld");
    });
  });

  describe("kebabCase", () => {
    it("should convert to kebab-case", () => {
      expect(utils.kebabCase("HelloWorld")).toBe("hello-world");
      expect(utils.kebabCase("helloWorld")).toBe("hello-world");
      expect(utils.kebabCase("hello_world")).toBe("hello-world");
      expect(utils.kebabCase("Hello World")).toBe("hello-world");
    });
  });

  describe("snakeCase", () => {
    it("should convert to snake_case", () => {
      expect(utils.snakeCase("HelloWorld")).toBe("hello_world");
      expect(utils.snakeCase("helloWorld")).toBe("hello_world");
      expect(utils.snakeCase("hello-world")).toBe("hello_world");
      expect(utils.snakeCase("Hello World")).toBe("hello_world");
    });
  });

  describe("pluralize", () => {
    it("should pluralize words", () => {
      expect(utils.pluralize("user")).toBe("users");
      expect(utils.pluralize("users")).toBe("users");
      expect(utils.pluralize("city")).toBe("cities");
      expect(utils.pluralize("box")).toBe("boxes");
      expect(utils.pluralize("church")).toBe("churches");
      expect(utils.pluralize("bush")).toBe("bushes");
    });
  });

  describe("singularize", () => {
    it("should singularize words", () => {
      expect(utils.singularize("users")).toBe("user");
      expect(utils.singularize("cities")).toBe("city");
      /* cspell:disable-next-line */
      expect(utils.singularize("boxes")).toBe("boxe");
      /* cspell:disable-next-line */
      expect(utils.singularize("churches")).toBe("churche");
    });
  });

  describe("capitalize", () => {
    it("should capitalize first letter", () => {
      expect(utils.capitalize("hello")).toBe("Hello");
      expect(utils.capitalize("HELLO")).toBe("HELLO");
      expect(utils.capitalize("hello world")).toBe("Hello world");
    });
  });

  describe("lower", () => {
    it("should convert to lowercase", () => {
      expect(utils.lower("HELLO")).toBe("hello");
      expect(utils.lower("Hello World")).toBe("hello world");
    });
  });

  describe("upper", () => {
    it("should convert to uppercase", () => {
      expect(utils.upper("hello")).toBe("HELLO");
      expect(utils.upper("Hello World")).toBe("HELLO WORLD");
    });
  });
});
