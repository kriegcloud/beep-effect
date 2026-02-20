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
import { describe, expect, it } from "vitest";
import yaml from "yaml";
import {
  convertSchemaToSteps,
  convertStepsToYamlString,
} from "../../../utils/schema/convertSchemaToSteps.js";

describe("Schema to YAML Integration", () => {
  it("should convert schema to valid YAML format", () => {
    const schema = P.defineMigration({}, () => {
      const position = {
        x: P.Double,
        y: P.Double,
      };

      const ObjectNode = P.defineRecord("ObjectNode", {
        docs: "A node in the graph",
        fields: {
          ...position,
          label: P.Optional(P.String),
        },
      });

      const TextBox = P.defineRecord("TextBox", {
        docs: "A text box",
        fields: {
          ...position,
          text: P.String,
        },
      });

      const Edge = P.defineRecord("Edge", {
        docs: "An edge between nodes",
        fields: {
          source: () => ObjectNode,
          target: () => ObjectNode,
        },
      });

      const Node = P.defineUnion("Node", {
        docs: "Any node type",
        variants: {
          object: ObjectNode,
          textBox: TextBox,
        },
      });

      return { ObjectNode, TextBox, Edge, Node };
    });

    const steps = convertSchemaToSteps(schema);
    const yamlString = convertStepsToYamlString(steps);
    const parsedSteps = yaml.parse(yamlString) as Array<Record<string, unknown>>;

    expect(parsedSteps).toBeInstanceOf(Array);
    expect(parsedSteps.length).toBeGreaterThan(0);

    const recordsStep = parsedSteps.find(step => "add-records" in step);
    expect(recordsStep).toBeDefined();
    expect(recordsStep?.["add-records"]).toMatchObject({
      ObjectNode: {
        fields: {
          x: "double",
          y: "double",
          label: "optional<string>",
        },
      },
      TextBox: {
        fields: {
          x: "double",
          y: "double",
          text: "string",
        },
      },
      Edge: {
        fields: {
          source: "ObjectNode",
          target: "ObjectNode",
        },
      },
    });

    const unionStep = parsedSteps.find(step => "add-union" in step);
    expect(unionStep).toBeDefined();
    expect(unionStep?.["add-union"]).toMatchObject({
      Node: {
        variants: {
          object: "ObjectNode",
          textBox: "TextBox",
        },
      },
    });
  });
});
