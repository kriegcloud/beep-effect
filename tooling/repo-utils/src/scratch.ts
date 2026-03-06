import { BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";
import * as S from "effect/Schema";
import { SymbolFilePath, SymbolKind, SymbolQualifiedName } from "./TSMorph/TSMorph.model.ts";

const DemoSymbolId = S.TemplateLiteral([SymbolFilePath, "::", SymbolQualifiedName, "#", SymbolKind]);

const DemoSymbolIdParts = S.TemplateLiteralParser([SymbolFilePath, "::", SymbolQualifiedName, "#", SymbolKind]);

const decodeSymbolFilePath = S.decodeUnknownSync(SymbolFilePath);
const decodeSymbolQualifiedName = S.decodeUnknownSync(SymbolQualifiedName);
const decodeSymbolKind = S.decodeUnknownSync(SymbolKind);
const decodeDemoSymbolId = S.decodeUnknownSync(DemoSymbolId);
const decodeDemoSymbolIdParts = S.decodeUnknownSync(DemoSymbolIdParts);

const demoFilePath = decodeSymbolFilePath("tooling/repo-utils/src/scratch.ts");
const demoQualifiedName = decodeSymbolQualifiedName("UserService.login");
const demoKind = decodeSymbolKind("MethodDeclaration");
const demoSymbolId = decodeDemoSymbolId(`${demoFilePath}::${demoQualifiedName}#${demoKind}`);

const program = Effect.gen(function* () {
  const parsed = decodeDemoSymbolIdParts(demoSymbolId);

  yield* Effect.log("TemplateLiteral / TemplateLiteralParser demo for SymbolId");
  yield* Effect.log({
    demoSymbolId,
    parsed,
    filePath: parsed[0],
    qualifiedName: parsed[2],
    kind: parsed[4],
  });
});

BunRuntime.runMain(program);
