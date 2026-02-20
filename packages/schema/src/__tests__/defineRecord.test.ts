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
import { defineRecord } from "../defineRecord.js";
import type { Array, Double, Optional, String } from "../primitives.js";
import * as P from "../primitives.js";
import { assertExactKeys, assertTypeEquals } from "./testTypeUtils.js";

describe("defineRecord", () => {
  it("should create a basic record definition", () => {
    const PersonRecord = defineRecord("Person", {
      docs: "A person record",
      fields: {
        name: P.String,
        age: P.Double,
      },
    });

    expect(PersonRecord.type).toBe("record");
    expect(PersonRecord.name).toBe("Person");
    expect(PersonRecord.docs).toBe("A person record");
    expect(PersonRecord.fields.name).toEqual({ type: "string" });
    expect(PersonRecord.fields.age).toEqual({ type: "double" });

    assertExactKeys<typeof PersonRecord.fields, "name" | "age">();
    assertTypeEquals<typeof PersonRecord.fields.name, String>();
    assertTypeEquals<typeof PersonRecord.fields.age, Double>();
  });

  it("should handle optional fields", () => {
    const UserRecord = defineRecord("User", {
      docs: "A user record",
      fields: {
        username: P.String,
        email: P.Optional(P.String),
        age: P.Optional(P.Double),
        active: P.Optional(P.Boolean),
      },
    });

    expect(UserRecord.fields.username).toEqual({ type: "string" });
    expect(UserRecord.fields.email).toEqual({
      type: "optional",
      item: { type: "string" },
    });
    expect(UserRecord.fields.age).toEqual({
      type: "optional",
      item: { type: "double" },
    });
    expect(UserRecord.fields.active).toEqual({
      type: "optional",
      item: { type: "boolean" },
    });

    assertExactKeys<typeof UserRecord.fields, "username" | "email" | "age" | "active">();
    assertTypeEquals<typeof UserRecord.fields.username, String>();
    assertTypeEquals<typeof UserRecord.fields.email, Optional<String>>();
    assertTypeEquals<typeof UserRecord.fields.age, Optional<Double>>();
  });

  it("should handle array fields", () => {
    const TodoListRecord = defineRecord("TodoList", {
      docs: "A todo list",
      fields: {
        title: P.String,
        items: P.Array(P.String),
        priorities: P.Array(P.Double),
      },
    });

    expect(TodoListRecord.fields.items).toEqual({
      type: "array",
      items: { type: "string" },
    });
    expect(TodoListRecord.fields.priorities).toEqual({
      type: "array",
      items: { type: "double" },
    });

    assertExactKeys<typeof TodoListRecord.fields, "title" | "items" | "priorities">();
    assertTypeEquals<typeof TodoListRecord.fields.title, String>();
    assertTypeEquals<typeof TodoListRecord.fields.items, Array<String>>();
    assertTypeEquals<typeof TodoListRecord.fields.priorities, Array<Double>>();
  });

  it("should handle nested optional arrays", () => {
    const ComplexRecord = defineRecord("Complex", {
      docs: "A complex record",
      fields: {
        optionalStringArray: P.Optional(P.Array(P.String)),
        arrayOfOptionalStrings: P.Array(P.Optional(P.String)),
      },
    });

    expect(ComplexRecord.fields.optionalStringArray).toEqual({
      type: "optional",
      item: {
        type: "array",
        items: { type: "string" },
      },
    });
    expect(ComplexRecord.fields.arrayOfOptionalStrings).toEqual({
      type: "array",
      items: {
        type: "optional",
        item: { type: "string" },
      },
    });

    assertExactKeys<
      typeof ComplexRecord.fields,
      "optionalStringArray" | "arrayOfOptionalStrings"
    >();
    assertTypeEquals<
      typeof ComplexRecord.fields.optionalStringArray,
      P.Optional<P.Array<P.String>>
    >();
    assertTypeEquals<
      typeof ComplexRecord.fields.arrayOfOptionalStrings,
      P.Array<P.Optional<P.String>>
    >();
  });

  it("should handle record references", () => {
    const AuthorRecord = defineRecord("Author", {
      docs: "An author",
      fields: {
        name: P.String,
      },
    });

    const BookRecord = defineRecord("Book", {
      docs: "A book",
      fields: {
        title: P.String,
        author: AuthorRecord,
      },
    });

    expect(BookRecord.fields.author).toEqual({
      type: "ref",
      refType: "record",
      name: "Author",
    });
  });

  it("should support function references for self-referencing structures", () => {
    const NodeRecord = defineRecord("Node", {
      docs: "A node in a graph",
      fields: {
        value: P.String,
      },
    });

    expect(NodeRecord.name).toBe("Node");
    expect(NodeRecord.fields.value).toEqual({ type: "string" });
  });
});
