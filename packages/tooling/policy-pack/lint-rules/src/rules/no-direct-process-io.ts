/**
 * Oxlint rule for process writes and exits that bypass the Effect runtime.
 *
 * @packageDocumentation
 * @since 0.1.0
 */

import { defineRule } from "@oxlint/plugins";
import * as A from "effect/Array";
import * as O from "effect/Option";
import {
  getPropertyName,
  isIdentifier,
  pathMatchesSuffix,
  toRepoPath,
  unwrapExpression,
  unwrapMemberExpression,
} from "./utils.ts";
import type { ESTree } from "@oxlint/plugins";
import type { AstNode, MaybeNode } from "./utils.ts";

// These calls run at synchronous host boundaries: the IPC guard and error reporter
// cannot yield an Effect; the CLI repairs the TTY and exits after stream drain;
// docgen forces a successful exit after its runtime has completed.
// Match both file and operation so a new direct write in either entrypoint is flagged.
const HOST_OPERATIONS: ReadonlyArray<readonly [path: string, operation: string]> = [
  ["apps/professional-desktop/server/IpcStdoutGuard.prelude.ts", "process.stderr.write"],
  ["packages/foundation/capability/observability/src/server/ErrorReporting.ts", "process.stderr.write"],
  ["packages/tooling/tool/cli/src/bin-main.ts", "process.stdout.write"],
  ["packages/tooling/tool/cli/src/bin-main.ts", "process.exit"],
  ["packages/tooling/tool/docgen/src/bin.ts", "process.exit"],
];

const productionTypeScript = (path: string): boolean =>
  /\.(?:[cm]?ts|tsx)$/u.test(path) &&
  !/(?:^|\/)(?:test|tests|fixtures)(?:\/|$)/u.test(path) &&
  !/\.(?:test|spec)\.[cm]?tsx?$/u.test(path);

/**
 * Blocks direct process output and termination in production TypeScript.
 *
 * **Example** (Find the runtime boundary rule)
 *
 * ```ts
 * import { ok } from "node:assert/strict"
 * import plugin from "@beep/lint-rules/oxlint"
 *
 * ok(plugin.rules["no-direct-process-io"])
 * ```
 *
 * @category tools
 * @since 0.1.0
 */
export const noDirectProcessIo = defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Use Effect Console, Stdio, and runMain for process output and exit.",
    },
  },
  createOnce(context) {
    const path = () => toRepoPath(context.filename, context.cwd);
    const scopes: Array<{ process: boolean; bun: boolean }> = [{ process: false, bun: false }];
    const currentScope = () => scopes[scopes.length - 1] ?? { process: false, bun: false };
    const shadowed = (name: "process" | "bun"): boolean => A.some(scopes, (scope) => scope[name]);
    const pushScope = (params: ReadonlyArray<ESTree.ParamPattern>) => {
      scopes.push({
        process: A.some(params, (param) => param.type === "Identifier" && param.name === "process"),
        bun: A.some(params, (param) => param.type === "Identifier" && param.name === "Bun"),
      });
    };
    const popScope = () => {
      if (scopes.length > 1) scopes.pop();
    };
    const member = (node: MaybeNode, name: string): O.Option<AstNode> =>
      O.flatMap(unwrapMemberExpression(node), (access) =>
        O.exists(getPropertyName(access.property), (property) => property === name) ? access.object : O.none()
      );
    const globalProcess = (node: MaybeNode): boolean =>
      (isIdentifier("process")(unwrapExpression(node)) && !shadowed("process")) ||
      O.exists(member(node, "process"), (object) => isIdentifier("globalThis")(unwrapExpression(object)));
    const globalBun = (node: MaybeNode): boolean =>
      (isIdentifier("Bun")(unwrapExpression(node)) && !shadowed("bun")) ||
      O.exists(member(node, "Bun"), (object) => isIdentifier("globalThis")(unwrapExpression(object)));
    const processStream = (node: MaybeNode): O.Option<string> =>
      O.flatMap(unwrapMemberExpression(node), (access) =>
        O.flatMap(getPropertyName(access.property), (stream) =>
          (stream === "stdout" || stream === "stderr") && O.exists(access.object, globalProcess)
            ? O.some(stream)
            : O.none()
        )
      );
    const bunStream = (node: MaybeNode): boolean =>
      O.exists(unwrapMemberExpression(node), (access) =>
        O.exists(
          getPropertyName(access.property),
          (stream) => (stream === "stdout" || stream === "stderr") && O.exists(access.object, globalBun)
        )
      );
    const allowed = (operation: string): boolean =>
      A.some(HOST_OPERATIONS, ([file, permitted]) => operation === permitted && pathMatchesSuffix(path(), file));
    const report = (node: ESTree.Node, operation: string) => {
      if (!allowed(operation)) {
        context.report({ node, message: `Use Effect Console, Stdio, or runMain instead of ${operation}.` });
      }
    };

    return {
      before() {
        scopes.length = 0;
        scopes.push({ process: false, bun: false });
      },
      FunctionDeclaration: (node) => pushScope(node.params),
      "FunctionDeclaration:exit": popScope,
      FunctionExpression: (node) => pushScope(node.params),
      "FunctionExpression:exit": popScope,
      ArrowFunctionExpression: (node) => pushScope(node.params),
      "ArrowFunctionExpression:exit": popScope,
      VariableDeclarator(node) {
        if (node.id.type === "Identifier") {
          if (node.id.name === "process") currentScope().process = true;
          if (node.id.name === "Bun") currentScope().bun = true;
        }
      },
      CallExpression(node) {
        if (!productionTypeScript(path())) return;
        if (O.exists(member(node.callee, "exit"), globalProcess)) report(node, "process.exit");
        if (O.exists(member(node.callee, "exit"), globalBun)) report(node, "Bun.exit");
        const writeReceiver = member(node.callee, "write");
        if (O.isNone(writeReceiver)) return;
        const stream = processStream(writeReceiver.value);
        if (O.isSome(stream)) report(node, `process.${stream.value}.write`);
        if (globalBun(writeReceiver.value) && A.some(node.arguments, bunStream))
          report(node, "Bun.write(Bun.stdout/stderr)");
      },
      AssignmentExpression(node) {
        if (
          productionTypeScript(path()) &&
          node.left.type === "MemberExpression" &&
          O.exists(member(node.left, "exitCode"), globalProcess)
        ) {
          report(node, "process.exitCode");
        }
      },
      UpdateExpression(node) {
        if (productionTypeScript(path()) && O.exists(member(node.argument, "exitCode"), globalProcess)) {
          report(node, "process.exitCode");
        }
      },
    };
  },
});
