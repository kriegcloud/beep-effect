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
import type { IFieldTypeUnion } from "../../../lib/pack-docschema-api/pack-docschema-ir/index.js";
import { convertStepsToIr } from "../convertStepsToIr.js";
import type { MigrationStep } from "../parseMigrationSteps.js";

describe("convertStepsToIr", () => {
  it("should convert simple record types to IR format", () => {
    const steps: MigrationStep[] = [
      {
        "add-records": {
          Person: {
            docs: "A person record",
            fields: {
              name: "string",
              age: "double",
              email: "optional<string>",
            },
          },
        },
      },
    ];

    const schema = convertStepsToIr(steps);

    expect(schema.name).toBe("Generated Schema");
    expect(schema.description).toBe("Schema generated from migration steps");
    expect(schema.version).toBe(1);
    expect(schema.primaryModelKeys).toEqual(["Person"]);
    expect(Object.keys(schema.models)).toHaveLength(1);

    const personModel = schema.models["Person"];
    expect(personModel).toBeDefined();
    expect(personModel?.type).toBe("record");
    if (personModel?.type !== "record") throw new Error("Expected record type");
    const personRecord = personModel.record;

    expect(personRecord.key).toBe("Person");
    expect(personRecord.name).toBe("Person");
    expect(personRecord.description).toBe("A person record");
    expect(personRecord.fields).toHaveLength(3);

    // Check name field
    const nameField = personRecord.fields.find(f => f.key === "name");
    expect(nameField).toBeDefined();
    expect(nameField?.isOptional).toBeUndefined();
    expect(nameField?.value).toEqual({
      type: "value",
      value: {
        type: "string",
        string: {},
      },
    });

    // Check age field
    const ageField = personRecord.fields.find(f => f.key === "age");
    expect(ageField).toBeDefined();
    expect(ageField?.value).toEqual({
      type: "value",
      value: {
        type: "double",
        double: {},
      },
    });

    // Check optional email field
    const emailField = personRecord.fields.find(f => f.key === "email");
    expect(emailField).toBeDefined();
    expect(emailField?.isOptional).toBe(true);
    expect(emailField?.value).toEqual({
      type: "value",
      value: {
        type: "string",
        string: {},
      },
    });
  });

  it("should convert array and list types to IR format", () => {
    const steps: MigrationStep[] = [
      {
        "add-records": {
          Container: {
            docs: "A container with collections",
            fields: {
              tags: "array<string>",
              numbers: "list<double>",
            },
          },
        },
      },
    ];

    const schema = convertStepsToIr(steps);
    const containerModel = schema.models["Container"];
    expect(containerModel).toBeDefined();
    expect(containerModel?.type).toBe("record");
    if (containerModel?.type !== "record") throw new Error("Expected record type");
    const containerRecord = containerModel.record;

    // Check tags array field
    const tagsField = containerRecord.fields.find(f => f.key === "tags");
    expect(tagsField?.value).toEqual({
      type: "array",
      array: {
        allowNullValue: false,
        value: {
          type: "string",
          string: {},
        },
      },
    });

    // Check numbers list field (treated as array)
    const numbersField = containerRecord.fields.find(f => f.key === "numbers");
    expect(numbersField?.value).toEqual({
      type: "array",
      array: {
        allowNullValue: false,
        value: {
          type: "double",
          double: {},
        },
      },
    });
  });

  it("should convert record references to IR format", () => {
    const steps: MigrationStep[] = [
      {
        "add-records": {
          Address: {
            fields: {
              street: "string",
              city: "string",
            },
          },
          Person: {
            fields: {
              name: "string",
              address: "Address",
            },
          },
        },
      },
    ];

    const schema = convertStepsToIr(steps);
    const personModel = schema.models["Person"];
    expect(personModel).toBeDefined();
    expect(personModel?.type).toBe("record");
    if (personModel?.type !== "record") throw new Error("Expected record type");
    const personRecord = personModel.record;

    const addressField = personRecord.fields.find(f => f.key === "address");
    expect(addressField?.value).toEqual(
      {
        type: "value",
        value: {
          type: "modelRef",
          modelRef: {
            modelTypes: ["Address"],
          },
        },
      } satisfies IFieldTypeUnion,
    );
  });

  it("should handle local fragments and extends", () => {
    const steps: MigrationStep[] = [
      {
        "local-fragment": {
          position: {
            x: "double",
            y: "double",
          },
        },
      },
      {
        "add-records": {
          ObjectNode: {
            docs: "A node with position",
            extends: ["position"],
            fields: {
              label: "string",
            },
          },
        },
      },
    ];

    const schema = convertStepsToIr(steps);
    const objectNodeModel = schema.models["ObjectNode"];
    expect(objectNodeModel).toBeDefined();
    expect(objectNodeModel?.type).toBe("record");
    if (objectNodeModel?.type !== "record") throw new Error("Expected record type");
    const objectNode = objectNodeModel.record;

    expect(objectNode.fields).toHaveLength(3);

    // Check inherited fields from fragment
    const xField = objectNode.fields.find(f => f.key === "x");
    expect(xField).toBeDefined();
    expect(xField?.value).toEqual({
      type: "value",
      value: {
        type: "double",
        double: {},
      },
    });

    const yField = objectNode.fields.find(f => f.key === "y");
    expect(yField).toBeDefined();

    // Check own field
    const labelField = objectNode.fields.find(f => f.key === "label");
    expect(labelField).toBeDefined();
  });

  it("should convert unions to IR format", () => {
    const steps: MigrationStep[] = [
      {
        "add-records": {
          ObjectNode: {
            fields: {
              label: "string",
            },
          },
          TextBox: {
            fields: {
              text: "string",
            },
          },
        },
      },
      {
        "add-union": {
          Node: {
            variants: {
              object: "ObjectNode",
              textBox: "TextBox",
            },
          },
        },
      },
      {
        "add-records": {
          Graph: {
            fields: {
              nodes: "array<Node>",
            },
          },
        },
      },
    ];

    const schema = convertStepsToIr(steps);
    const graphModel = schema.models["Graph"];
    if (graphModel?.type !== "record") throw new Error("Expected record type");
    const graphRecord = graphModel.record;

    const nodesField = graphRecord.fields.find(f => f.key === "nodes");
    expect(nodesField?.value).toEqual({
      type: "array",
      array: {
        allowNullValue: false,
        value: {
          type: "modelRef",
          modelRef: {
            modelTypes: ["Node"],
          },
        },
      },
    });
  });

  it("should handle modify-records step", () => {
    const steps: MigrationStep[] = [
      {
        "add-records": {
          Person: {
            fields: {
              name: "string",
            },
          },
        },
      },
      {
        "modify-records": {
          Person: {
            "add-fields": {
              age: "double",
              email: "optional<string>",
            },
          },
        },
      },
    ];

    const schema = convertStepsToIr(steps);
    const personModel = schema.models["Person"];
    expect(personModel).toBeDefined();
    expect(personModel?.type).toBe("record");
    if (personModel?.type !== "record") throw new Error("Expected record type");
    const personRecord = personModel.record;

    expect(personRecord.fields).toHaveLength(3);

    // Original field
    expect(personRecord.fields.find(f => f.key === "name")).toBeDefined();

    // Added fields
    expect(personRecord.fields.find(f => f.key === "age")).toBeDefined();

    const emailField = personRecord.fields.find(f => f.key === "email");
    expect(emailField).toBeDefined();
    expect(emailField?.isOptional).toBe(true);
  });
});
