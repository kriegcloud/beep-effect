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
import { defineMigration } from "../defineMigration.js";
import { defineRecord } from "../defineRecord.js";
import { defineUnion } from "../defineUnion.js";
import * as P from "../primitives.js";

describe("Integration Tests", () => {
  describe("Basic record relationships", () => {
    it("should create records with direct references", () => {
      const AuthorRecord = defineRecord("Author", {
        docs: "An author",
        fields: {
          name: P.String,
          email: P.String,
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
        name: "Author",
        refType: "record",
      });

      expect(BookRecord.fields.title).toEqual({
        type: "string",
      });
    });

    it("should create unions with record references", () => {
      const PersonRecord = defineRecord("Person", {
        docs: "A person entity",
        fields: {
          name: P.String,
          age: P.Double,
        },
      });

      const OrganizationRecord = defineRecord("Organization", {
        docs: "An organization entity",
        fields: {
          name: P.String,
          industry: P.String,
        },
      });

      const EntityUnion = defineUnion("Entity", {
        docs: "An entity",
        variants: {
          person: PersonRecord,
          organization: OrganizationRecord,
        },
      });

      expect(EntityUnion.variants.person).toEqual({
        type: "ref",
        name: "Person",
        refType: "record",
      });

      expect(EntityUnion.variants.organization).toEqual({
        type: "ref",
        name: "Organization",
        refType: "record",
      });
    });
  });

  describe("Schema evolution with migrations", () => {
    it("should evolve a schema through multiple versions", () => {
      // Version 1: Basic user schema
      const v1Schema = {
        User: defineRecord("User", {
          docs: "User account",
          fields: {
            username: P.String,
            email: P.String,
          },
        }),
      };

      // Version 2: Add profile information
      const v2Schema = defineMigration(v1Schema, schema => ({
        UserWithProfile: schema.User.addField("firstName", P.String)
          .addField("lastName", P.String)
          .addField("age", P.Optional(P.Double))
          .build(),
      }));

      expect(v2Schema.User).toBe(v1Schema.User);
      expect(v2Schema.UserWithProfile.fields.username).toEqual({
        type: "string",
      });
      expect(v2Schema.UserWithProfile.fields.firstName).toEqual({
        type: "string",
      });
      expect(v2Schema.UserWithProfile.fields.age).toEqual({
        type: "optional",
        item: { type: "double" },
      });
    });
  });
});
