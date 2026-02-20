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

import path from "path";
import { describe, expect, it } from "vitest";
import type {
  IFieldDef,
  IModelDef,
  IRealTimeDocumentSchema,
  IRecordDef,
  IUnionDef,
} from "../../../lib/pack-docschema-api/pack-docschema-ir/index.js";
import { generateModelsFromIr } from "../generateModelsFromIr.js";
import { formatWithPrettier } from "./formatWithPrettier.js";

describe("generateModelsFromIr", () => {
  const snapshotDir = path.join(__dirname, "__snapshots__", "generateModelsFromIr");

  it("should generate Model constants for simple record types", async () => {
    const personField1: IFieldDef = {
      key: "name",
      name: "Name",
      description: "Person name",
      value: {
        type: "value",
        value: {
          type: "string",
          string: { minLength: 2, maxLength: 50 },
        },
      },
      meta: { addedIn: 1 },
    };

    const personField2: IFieldDef = {
      key: "age",
      name: "Age",
      description: "Person age",
      value: {
        type: "value",
        value: {
          type: "integer",
          integer: { minValue: 0, maxValue: 150 },
        },
      },
      meta: { addedIn: 1 },
    };

    const personRecord: IRecordDef = {
      key: "Person",
      name: "Person",
      description: "A person record",
      fields: [personField1, personField2],
      meta: { addedIn: 1 },
    };

    const schema: IRealTimeDocumentSchema = {
      name: "Test Schema",
      description: "A test schema",
      version: 1,
      primaryModelKeys: ["Person"],
      models: {
        Person: {
          type: "record",
          record: personRecord,
        } as IModelDef,
      },
    };

    const result = await generateModelsFromIr(schema);
    const formatted = await formatWithPrettier(result);

    // Verify imports are properly formatted (no weird indentation)
    const lines = formatted.split("\n");
    const importLines = lines.filter(line => line.startsWith("import"));
    expect(importLines.length).toBeGreaterThan(0);
    // All imports should start at column 0 (no leading whitespace)
    importLines.forEach(line => {
      expect(line).toMatch(/^import/);
    });

    await expect(formatted).toMatchFileSnapshot(path.join(snapshotDir, "simple-record.ts"));
  });

  it("should generate Model constants with external ref fields", async () => {
    const eventField1: IFieldDef = {
      key: "documentRef",
      name: "Document Reference",
      description: "Reference to a document",
      value: {
        type: "value",
        value: {
          type: "docRef",
          docRef: {
            documentTypeRids: [],
          },
        },
      },
      meta: { addedIn: 1 },
    };

    const eventField2: IFieldDef = {
      key: "userRef",
      name: "User Reference",
      description: "Reference to a user",
      value: {
        type: "value",
        value: {
          type: "userRef",
          userRef: {},
        },
      },
      meta: { addedIn: 1 },
    };

    const eventField3: IFieldDef = {
      key: "timestamp",
      name: "Timestamp",
      description: "Event timestamp",
      value: {
        type: "value",
        value: {
          type: "datetime",
          datetime: {},
        },
      },
      meta: { addedIn: 1 },
    };

    const eventRecord: IRecordDef = {
      key: "Event",
      name: "Event",
      description: "An event record with external refs",
      fields: [eventField1, eventField2, eventField3],
      meta: { addedIn: 1 },
    };

    const schema: IRealTimeDocumentSchema = {
      name: "Test Schema",
      description: "A test schema with external refs",
      version: 1,
      primaryModelKeys: ["Event"],
      models: {
        Event: {
          type: "record",
          record: eventRecord,
        } as IModelDef,
      },
    };

    const result = await generateModelsFromIr(schema);
    const formatted = await formatWithPrettier(result);

    // Verify external ref fields are included in metadata
    expect(formatted).toContain("externalRefFieldTypes");
    expect(formatted).toContain("documentRef: 'docRef'");
    expect(formatted).toContain("userRef: 'userRef'");

    await expect(formatted).toMatchFileSnapshot(path.join(snapshotDir, "external-refs.ts"));
  });

  it("should generate Model constants for union types", async () => {
    // Define the ObjectNode record
    const objectNodeRecord: IRecordDef = {
      key: "ObjectNode",
      name: "ObjectNode",
      description: "A node in the graph",
      fields: [
        {
          key: "x",
          name: "X",
          description: "X coordinate",
          value: {
            type: "value",
            value: {
              type: "double",
              double: {},
            },
          },
          meta: { addedIn: 1 },
        },
        {
          key: "y",
          name: "Y",
          description: "Y coordinate",
          value: {
            type: "value",
            value: {
              type: "double",
              double: {},
            },
          },
          meta: { addedIn: 1 },
        },
      ],
      meta: { addedIn: 1 },
    };

    // Define the TextBox record
    const textBoxRecord: IRecordDef = {
      key: "TextBox",
      name: "TextBox",
      description: "A text box in the graph",
      fields: [
        {
          key: "x",
          name: "X",
          description: "X coordinate",
          value: {
            type: "value",
            value: {
              type: "double",
              double: {},
            },
          },
          meta: { addedIn: 1 },
        },
        {
          key: "text",
          name: "Text",
          description: "Text content",
          value: {
            type: "value",
            value: {
              type: "string",
              string: {},
            },
          },
          meta: { addedIn: 1 },
        },
      ],
      meta: { addedIn: 1 },
    };

    // Define the Node union
    const nodeUnion: IUnionDef = {
      key: "Node",
      discriminant: "type",
      name: "Node",
      description: "A node in the graph",
      variants: {
        object: "ObjectNode",
        "text-box": "TextBox",
      },
      meta: { addedIn: 1 },
    };

    const schema: IRealTimeDocumentSchema = {
      name: "Test Schema",
      description: "A test schema with unions",
      version: 1,
      primaryModelKeys: ["ObjectNode", "TextBox", "Node"],
      models: {
        ObjectNode: {
          type: "record",
          record: objectNodeRecord,
        } as IModelDef,
        TextBox: {
          type: "record",
          record: textBoxRecord,
        } as IModelDef,
        Node: {
          type: "union",
          union: nodeUnion,
        } as IModelDef,
      },
    };

    const result = await generateModelsFromIr(schema);
    const formatted = await formatWithPrettier(result);

    // Verify all models are generated (primary models + union variants)
    expect(formatted).toContain("export const ObjectNodeModel");
    expect(formatted).toContain("export const TextBoxModel");
    expect(formatted).toContain("export const NodeModel");
    expect(formatted).toContain("export const NodeObjectModel");
    expect(formatted).toContain("export const NodeTextBoxModel");

    // Verify DocumentSchema contains all models
    expect(formatted).toContain("export const DocumentModel");
    expect(formatted).toContain("ObjectNode: ObjectNodeModel");
    expect(formatted).toContain("TextBox: TextBoxModel");
    expect(formatted).toContain("Node: NodeModel");
    expect(formatted).toContain("NodeObject: NodeObjectModel");
    expect(formatted).toContain("NodeTextBox: NodeTextBoxModel");

    await expect(formatted).toMatchFileSnapshot(path.join(snapshotDir, "union-types.ts"));
  });

  it("should generate Model constants with custom discriminant", async () => {
    const catRecord: IRecordDef = {
      key: "Cat",
      name: "Cat",
      description: "A cat",
      fields: [
        {
          key: "meow",
          name: "Meow",
          description: "Cat sound",
          value: {
            type: "value",
            value: {
              type: "string",
              string: {},
            },
          },
          meta: { addedIn: 1 },
        },
      ],
      meta: { addedIn: 1 },
    };

    const dogRecord: IRecordDef = {
      key: "Dog",
      name: "Dog",
      description: "A dog",
      fields: [
        {
          key: "bark",
          name: "Bark",
          description: "Dog sound",
          value: {
            type: "value",
            value: {
              type: "string",
              string: {},
            },
          },
          meta: { addedIn: 1 },
        },
      ],
      meta: { addedIn: 1 },
    };

    const animalUnion: IUnionDef = {
      key: "Animal",
      discriminant: "kind",
      name: "Animal",
      description: "An animal union with custom discriminant",
      variants: {
        cat: "Cat",
        dog: "Dog",
      },
      meta: { addedIn: 1 },
    };

    const schema: IRealTimeDocumentSchema = {
      name: "Test Schema",
      description: "A test schema with custom discriminant",
      version: 1,
      primaryModelKeys: ["Cat", "Dog", "Animal"],
      models: {
        Cat: {
          type: "record",
          record: catRecord,
        } as IModelDef,
        Dog: {
          type: "record",
          record: dogRecord,
        } as IModelDef,
        Animal: {
          type: "union",
          union: animalUnion,
        } as IModelDef,
      },
    };

    const result = await generateModelsFromIr(schema);
    const formatted = await formatWithPrettier(result);

    expect(formatted).toContain("discriminant: 'kind'");
    expect(formatted).toContain("export const AnimalModel");
    expect(formatted).toContain("export const AnimalCatModel");
    expect(formatted).toContain("export const AnimalDogModel");

    await expect(formatted).toMatchFileSnapshot(
      path.join(snapshotDir, "custom-discriminant.ts"),
    );
  });
});
