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
import { assertExactKeys, assertHasKeys, assertTypeEquals } from "./testTypeUtils.js";

describe("defineMigration", () => {
  it("should create a new schema by extending record fields", () => {
    const v1Schema = {
      Person: defineRecord("Person", {
        docs: "A person",
        fields: {
          name: P.String,
        },
      }),
    };

    const v2Schema = defineMigration(v1Schema, schema => ({
      EnhancedPerson: schema.Person.addField("age", P.Double).build(),
    }));

    expect(v2Schema.Person).toBe(v1Schema.Person);
    expect(v2Schema.EnhancedPerson.name).toBe("Person");
    expect(v2Schema.EnhancedPerson.fields.name).toEqual({ type: "string" });
    expect(v2Schema.EnhancedPerson.fields.age).toEqual({ type: "double" });

    assertHasKeys<typeof v2Schema, "Person" | "EnhancedPerson">();
    assertExactKeys<typeof v2Schema.EnhancedPerson.fields, "name" | "age">();
    assertTypeEquals<typeof v2Schema.EnhancedPerson.fields.name, P.String>();
    assertTypeEquals<typeof v2Schema.EnhancedPerson.fields.age, P.Double>();
  });

  it("should handle multiple field additions", () => {
    const v1Schema = {
      User: defineRecord("User", {
        docs: "A user",
        fields: {
          username: P.String,
        },
      }),
    };

    const v2Schema = defineMigration(v1Schema, schema => ({
      ExtendedUser: schema.User.addField("email", P.String)
        .addField("age", P.Optional(P.Double))
        .build(),
    }));

    expect(v2Schema.ExtendedUser.fields.username).toEqual({ type: "string" });
    expect(v2Schema.ExtendedUser.fields.email).toEqual({ type: "string" });
    expect(v2Schema.ExtendedUser.fields.age).toEqual({
      type: "optional",
      item: { type: "double" },
    });

    assertExactKeys<typeof v2Schema.ExtendedUser.fields, "username" | "email" | "age">();
    assertTypeEquals<typeof v2Schema.ExtendedUser.fields.username, P.String>();
    assertTypeEquals<typeof v2Schema.ExtendedUser.fields.email, P.String>();
    assertTypeEquals<typeof v2Schema.ExtendedUser.fields.age, P.Optional<P.Double>>();
  });

  it("should extend union types", () => {
    const CircleRecord = defineRecord("Circle", {
      docs: "A circle",
      fields: {
        radius: P.Double,
      },
    });

    const RectangleRecord = defineRecord("Rectangle", {
      docs: "A rectangle",
      fields: {
        width: P.Double,
        height: P.Double,
      },
    });

    const v1Schema = {
      Shape: defineUnion("Shape", {
        docs: "A shape",
        variants: {
          circle: CircleRecord,
        },
      }),
    };

    const v2Schema = defineMigration(v1Schema, schema => ({
      ExtendedShape: schema.Shape.addVariant("rectangle", RectangleRecord).build(),
    }));

    expect(v2Schema.ExtendedShape.variants.circle).toEqual({
      type: "ref",
      name: "Circle",
      refType: "record",
    });
    expect(v2Schema.ExtendedShape.variants.rectangle).toEqual({
      type: "ref",
      name: "Rectangle",
      refType: "record",
    });

    assertExactKeys<typeof v2Schema.ExtendedShape.variants, "circle" | "rectangle">();
  });

  it("should handle multiple union member additions", () => {
    const TextRecord = defineRecord("Text", {
      docs: "Text value",
      fields: { value: P.String },
    });

    const NumberRecord = defineRecord("Number", {
      docs: "Number value",
      fields: { value: P.Double },
    });

    const OptionalTextRecord = defineRecord("OptionalText", {
      docs: "Optional text value",
      fields: { value: P.Optional(P.String) },
    });

    const v1Schema = {
      Value: defineUnion("Value", {
        docs: "A value",
        variants: {
          text: TextRecord,
        },
      }),
    };

    const v2Schema = defineMigration(v1Schema, schema => ({
      ExtendedValue: schema.Value.addVariant("number", NumberRecord)
        .addVariant("optional_text", OptionalTextRecord)
        .build(),
    }));

    expect(v2Schema.ExtendedValue.variants.text).toEqual({
      type: "ref",
      name: "Text",
      refType: "record",
    });
    expect(v2Schema.ExtendedValue.variants.number).toEqual({
      type: "ref",
      name: "Number",
      refType: "record",
    });
    expect(v2Schema.ExtendedValue.variants.optional_text).toEqual({
      type: "ref",
      name: "OptionalText",
      refType: "record",
    });

    assertExactKeys<typeof v2Schema.ExtendedValue.variants, "text" | "number" | "optional_text">();
  });

  it("should preserve original schema alongside new definitions", () => {
    const originalRecord = defineRecord("Original", {
      docs: "Original record",
      fields: {
        value: P.String,
      },
    });

    const v1Schema = {
      Original: originalRecord,
    };

    const v2Schema = defineMigration(v1Schema, schema => ({
      Modified: schema.Original.addField("extra", P.Double).build(),
    }));

    expect(v2Schema.Original).toBe(originalRecord);
    expect(v2Schema.Modified.fields.value).toEqual({ type: "string" });
    expect(v2Schema.Modified.fields.extra).toEqual({ type: "double" });

    assertHasKeys<typeof v2Schema, "Original" | "Modified">();
    assertExactKeys<typeof v2Schema.Modified.fields, "value" | "extra">();
    assertTypeEquals<typeof v2Schema.Modified.fields.value, P.String>();
    assertTypeEquals<typeof v2Schema.Modified.fields.extra, P.Double>();
  });

  it("should handle mixed record and union migrations", () => {
    const PersonRecord = defineRecord("Person", {
      docs: "A person",
      fields: {
        name: P.String,
      },
    });

    const OrganizationRecord = defineRecord("Organization", {
      docs: "An organization",
      fields: {
        orgName: P.String,
      },
    });

    const v1Schema = {
      Person: PersonRecord,
      Entity: defineUnion("Entity", {
        docs: "An entity",
        variants: {
          person: PersonRecord,
        },
      }),
    };

    const v2Schema = defineMigration(v1Schema, schema => ({
      ExtendedPerson: schema.Person.addField("age", P.Double).build(),
      ExtendedEntity: schema.Entity.addVariant("organization", OrganizationRecord).build(),
    }));

    expect(v2Schema.ExtendedPerson.fields.name).toEqual({ type: "string" });
    expect(v2Schema.ExtendedPerson.fields.age).toEqual({ type: "double" });
    expect(v2Schema.ExtendedEntity.variants.person).toEqual({
      type: "ref",
      name: "Person",
      refType: "record",
    });
    expect(v2Schema.ExtendedEntity.variants.organization).toEqual({
      type: "ref",
      name: "Organization",
      refType: "record",
    });

    assertHasKeys<typeof v2Schema, "Person" | "Entity" | "ExtendedPerson" | "ExtendedEntity">();
    assertExactKeys<typeof v2Schema.ExtendedPerson.fields, "name" | "age">();
    assertExactKeys<typeof v2Schema.ExtendedEntity.variants, "person" | "organization">();
  });

  it("should maintain correct references and names", () => {
    const v1Schema = {
      TestRecord: defineRecord("TestRecord", {
        docs: "Test record",
        fields: {
          field1: P.String,
        },
      }),
    };

    const v2Schema = defineMigration(v1Schema, schema => ({
      ModifiedRecord: schema.TestRecord.addField("field2", P.Double).build(),
    }));

    expect(v2Schema.ModifiedRecord.name).toBe("TestRecord");
    expect(v2Schema.ModifiedRecord.type).toBe("record");
    expect(v2Schema.ModifiedRecord.fields.field1).toEqual({ type: "string" });
    expect(v2Schema.ModifiedRecord.fields.field2).toEqual({ type: "double" });
  });
});
