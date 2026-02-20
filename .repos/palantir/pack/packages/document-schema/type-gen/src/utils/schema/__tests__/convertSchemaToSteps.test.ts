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

import * as P from "@palantir/pack.schema";
import path from "path";
import { describe, expect, it } from "vitest";
import { convertSchemaToSteps, convertStepsToYamlString } from "../convertSchemaToSteps.js";

describe("convertSchemaToSteps", () => {
  it("should convert a simple record schema to YAML steps", () => {
    const schema = P.defineMigration({}, () => {
      const Person = P.defineRecord("Person", {
        docs: "A person record",
        fields: {
          name: P.String,
          age: P.Double,
          email: P.Optional(P.String),
        },
      });
      return { Person };
    });

    const steps = convertSchemaToSteps(schema);

    expect(steps).toHaveLength(1);
    expect(steps[0]).toHaveProperty("add-records");
    expect(steps[0]!["add-records"]).toHaveProperty("Person");
    expect(steps[0]!["add-records"]!.Person!.fields).toEqual({
      name: "string",
      age: "double",
      email: "optional<string>",
    });
  });

  it("should handle union types", () => {
    const schema = P.defineMigration({}, () => {
      const Person = P.defineRecord("Person", {
        docs: "A person record",
        fields: {
          name: P.String,
        },
      });

      const Company = P.defineRecord("Company", {
        docs: "A company record",
        fields: {
          name: P.String,
        },
      });

      const Entity = P.defineUnion("Entity", {
        docs: "Entity union",
        variants: {
          person: Person,
          company: Company,
        },
      });

      return { Person, Company, Entity };
    });

    const steps = convertSchemaToSteps(schema);

    expect(steps).toHaveLength(2);
    expect(steps[0]!["add-records"]).toHaveProperty("Person");
    expect(steps[0]!["add-records"]).toHaveProperty("Company");
    expect(steps[1]!["add-union"]).toHaveProperty("Entity");
    expect(steps[1]!["add-union"]!.Entity).toEqual({
      variants: {
        person: "Person",
        company: "Company",
      },
    });
  });

  it("should preserve record names as defined", () => {
    const schema = P.defineMigration({}, () => {
      const ObjectNode = P.defineRecord("ObjectNode", {
        docs: "Object node",
        fields: {
          x: P.Double,
        },
      });
      return { ObjectNode };
    });

    const steps = convertSchemaToSteps(schema);

    expect(steps[0]!["add-records"]).toHaveProperty("ObjectNode");
  });

  it("should handle array types", () => {
    const schema = P.defineMigration({}, () => {
      const Container = P.defineRecord("Container", {
        docs: "Container record",
        fields: {
          items: P.Array(P.String),
          values: P.Array(P.Double),
        },
      });
      return { Container };
    });

    const steps = convertSchemaToSteps(schema);

    expect(steps[0]!["add-records"]!.Container!.fields).toEqual({
      items: "array<string>",
      values: "array<double>",
    });
  });

  it("should handle record references", () => {
    const schema = P.defineMigration({}, () => {
      const Node = P.defineRecord("Node", {
        docs: "Node record",
        fields: {
          x: P.Double,
        },
      });

      const Edge = P.defineRecord("Edge", {
        docs: "Edge record",
        fields: {
          source: () => Node,
          target: () => Node,
        },
      });
      return { Edge };
    });

    const steps = convertSchemaToSteps(schema);

    expect(steps[0]!["add-records"]!.Edge!.fields).toEqual({
      source: "Node",
      target: "Node",
    });
  });

  describe("YAML output snapshots", () => {
    it("should generate correct YAML for complex schema", async () => {
      const schema = P.defineMigration({}, () => {
        const ObjectNode = P.defineRecord("ObjectNode", {
          docs: "Represents a node in a graph",
          fields: {
            x: P.Double,
            y: P.Double,
            label: P.Optional(P.String),
          },
        });

        const TextBox = P.defineRecord("TextBox", {
          docs: "Represents a text box",
          fields: {
            x: P.Double,
            y: P.Double,
            text: P.String,
          },
        });

        const Edge = P.defineRecord("Edge", {
          docs: "Represents an edge",
          fields: {
            source: () => ObjectNode,
            target: () => ObjectNode,
          },
        });

        const Node = P.defineUnion("Node", {
          docs: "Node union",
          variants: {
            object: ObjectNode,
            textBox: TextBox,
          },
        });

        return { ObjectNode, TextBox, Edge, Node };
      });

      const steps = convertSchemaToSteps(schema);
      const yamlOutput = convertStepsToYamlString(steps);
      const snapshotPath = path.join(__dirname, "__snapshots__", "schema", "complex-schema.yaml");

      await expect(yamlOutput).toMatchFileSnapshot(snapshotPath);
    });

    it("should generate correct YAML for schema with various field types", async () => {
      const schema = P.defineMigration({}, () => {
        const OtherRecord = P.defineRecord("OtherRecord", {
          docs: "Other record",
          fields: {
            id: P.String,
          },
        });

        const AllFieldTypes = P.defineRecord("AllFieldTypes", {
          docs: "Test all field types",
          fields: {
            stringField: P.String,
            doubleField: P.Double,
            booleanField: P.Optional(P.Boolean),
            optionalField: P.Optional(P.String),
            arrayField: P.Array(P.Double),
            unknownField: P.Unknown,
            refField: () => OtherRecord,
          },
        });

        return { OtherRecord, AllFieldTypes };
      });

      const steps = convertSchemaToSteps(schema);
      const yamlOutput = convertStepsToYamlString(steps);
      const snapshotPath = path.join(__dirname, "__snapshots__", "schema", "all-field-types.yaml");

      await expect(yamlOutput).toMatchFileSnapshot(snapshotPath);
    });
  });
});
