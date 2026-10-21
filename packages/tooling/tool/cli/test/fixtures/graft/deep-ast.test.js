// Structural parser regressions only; no graph writes or model calls.
// GRAFT_EXTRACT_MODULE must refer to a full disposable patched Graft package.
import * as NodeAssert from "node:assert/strict";
import * as NodeChildProcess from "node:child_process";
import * as NodeOS from "node:os";
import * as NodePath from "node:path";
import * as NodeTest from "node:test";
import * as NodeURL from "node:url";

const modulePath =
  process.env.GRAFT_EXTRACT_MODULE ??
  NodePath.join(
    NodeChildProcess.execFileSync("npm", ["root", "-g", "--prefix", NodePath.join(NodeOS.homedir(), ".local")], {
      encoding: "utf8",
    }).trim(),
    "@nanonets/graft/dist/graph/extract.js"
  );
const { extractFile } = await import(NodeURL.pathToFileURL(modulePath).href);

NodeTest.test("a realistic generated IAM union traverses all extraction passes without overflowing", () => {
  const source =
    "// Generated IAM action fixture.\nexport type IamAction =\n" +
    Array.from({ length: 20000 }, (_, i) => `  | "service:Action${i}"`).join("\n") +
    "\n  | (string & {});\n";
  const result = extractFile("actions.generated.ts", source, "typescript");
  NodeAssert.deepEqual(
    result.nodes.map(({ id, kind }) => ({ id, kind })),
    [
      { id: "actions.generated.ts", kind: "file" },
      { id: "actions.generated.ts#IamAction", kind: "type" },
    ]
  );
  NodeAssert.equal(result.nodes[1].span, "L2-L20003");
  NodeAssert.ok(source.length > 400000);
  NodeAssert.equal(result.nodes[0].chars, source.length);
  NodeAssert.deepEqual(result.rawEdges, [
    {
      source: "actions.generated.ts",
      relation: "contains",
      targetId: "actions.generated.ts#IamAction",
      file: "actions.generated.ts",
    },
  ]);
});

NodeTest.test("TypeScript aliases, method bindings, and duplicate ids retain document order", () => {
  const source = `import { Service as Base } from './service';
export class Thing { method() { const local = new Base(); local.run(); } }
function same() { Thing(); }
function same() { Base(); }
export type Flags = 'a' | 'b' | 'c';`;
  const result = extractFile("fixture.ts", source, "typescript");
  NodeAssert.deepEqual(
    result.nodes.map((node) => node.id),
    [
      "fixture.ts",
      "fixture.ts#Thing",
      "fixture.ts#Thing.method",
      "fixture.ts#same",
      "fixture.ts#same~2",
      "fixture.ts#Flags",
    ]
  );
  NodeAssert.deepEqual(
    result.rawEdges
      .filter((edge) => edge.relation === "calls")
      .map(({ source, name, recvType }) => [source, name, recvType]),
    [
      ["fixture.ts#Thing.method", "run", "Service"],
      ["fixture.ts#same", "Thing", undefined],
      ["fixture.ts#same~2", "Base", undefined],
    ]
  );
  NodeAssert.deepEqual(
    result.rawEdges.filter((edge) => edge.relation === "references"),
    [
      {
        source: "fixture.ts#Thing.method",
        relation: "references",
        name: "Service",
        specifier: "./service",
        file: "fixture.ts",
      },
    ]
  );
});

NodeTest.test("Python import aliases and nested function scopes retain their receivers", () => {
  const source = `from pkg import Engine as Driver
class Outer:
    def method(self):
        obj = Driver()
        obj.run()
        def nested():
            Driver()
        nested()
`;
  const result = extractFile("fixture.py", source, "python");
  NodeAssert.deepEqual(
    result.nodes.map((node) => node.id),
    ["fixture.py", "fixture.py#Outer", "fixture.py#Outer.method", "fixture.py#Outer.method.nested"]
  );
  NodeAssert.deepEqual(
    result.rawEdges
      .filter((edge) => edge.relation === "calls")
      .map(({ source, name, recvType }) => [source, name, recvType]),
    [
      ["fixture.py#Outer.method", "Driver", undefined],
      ["fixture.py#Outer.method", "run", "Engine"],
      ["fixture.py#Outer.method.nested", "Driver", undefined],
      ["fixture.py#Outer.method", "nested", undefined],
    ]
  );
});

NodeTest.test("PHP enum recovery keeps enum methods and following definitions in their own scopes", () => {
  const source = `<?php enum Color { case Red; public function render() { ping(); } }
function ping() {}
class Outer { public function run() { ping(); } }`;
  const result = extractFile("fixture.php", source, "php");
  NodeAssert.deepEqual(
    result.nodes.map(({ id, kind }) => ({ id, kind })),
    [
      { id: "fixture.php", kind: "file" },
      { id: "fixture.php#Color", kind: "enum" },
      { id: "fixture.php#Color.render", kind: "method" },
      { id: "fixture.php#ping", kind: "function" },
      { id: "fixture.php#Outer", kind: "class" },
      { id: "fixture.php#Outer.run", kind: "method" },
    ]
  );
  NodeAssert.deepEqual(
    result.rawEdges.filter((edge) => edge.relation === "calls").map(({ source, name }) => [source, name]),
    [
      ["fixture.php#Color.render", "ping"],
      ["fixture.php#Outer.run", "ping"],
    ]
  );
});
