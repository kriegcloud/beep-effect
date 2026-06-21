import { defineRule } from "@oxlint/plugins";
import * as HashSet from "effect/HashSet";
import * as Option from "effect/Option";
import { asExpression, getPropertyName, isIdentifier, unwrapExpression, unwrapMemberExpression } from "./utils.ts";
import type { ESTree } from "@oxlint/plugins";
import type { MaybeNode } from "./utils.ts";

// Effect Schema decoder/encoder APIs allocate compiled functions. Keep them
// outside function bodies so hot paths do not rebuild compilers per call.
const COMPILER_METHODS = HashSet.fromIterable([
  "is",
  "asserts",
  "decodeEffect",
  "decodeExit",
  "decodeOption",
  "decodePromise",
  "decodeResult",
  "decodeSync",
  "decodeUnknownExit",
  "decodeUnknownEffect",
  "decodeUnknownOption",
  "decodeUnknownPromise",
  "decodeUnknownResult",
  "decodeUnknownSync",

  "encodeExit",
  "encodeEffect",
  "encodeOption",
  "encodePromise",
  "encodeResult",
  "encodeSync",
  "encodeUnknownExit",
  "encodeUnknownEffect",
  "encodeUnknownOption",
  "encodeUnknownPromise",
  "encodeUnknownResult",
  "encodeUnknownSync",
]);

const getSchemaCompilerMethod = (callee: MaybeNode): Option.Option<string> =>
  unwrapMemberExpression(callee).pipe(
    Option.filter((access) => isIdentifier(access.object, "Schema")),
    Option.flatMap((access) => getPropertyName(access.property)),
    Option.filter((method) => HashSet.has(COMPILER_METHODS, method))
  );

const isStaticSchemaReference = (node: MaybeNode): boolean => {
  const expression = unwrapExpression(node);
  if (Option.isNone(expression)) return false;

  if (expression.value.type === "Identifier") {
    const [firstChar] = expression.value.name;
    return firstChar !== undefined && firstChar.toUpperCase() === firstChar;
  }

  return expression.value.type === "MemberExpression";
};

/** Narrow `node` to a `Schema.<method>(...)` call, yielding its method name and arguments. */
const asSchemaMethodCall = (
  node: MaybeNode
): Option.Option<{ readonly method: Option.Option<string>; readonly args: ReadonlyArray<ESTree.Argument> }> =>
  unwrapExpression(node).pipe(
    Option.filter((expression) => expression.type === "CallExpression"),
    Option.flatMap((call) =>
      unwrapMemberExpression(call.callee).pipe(
        Option.filter((access) => isIdentifier(access.object, "Schema")),
        Option.map((access) => ({ method: getPropertyName(access.property), args: call.arguments }))
      )
    )
  );

const isNestedStaticSchemaCall = (node: MaybeNode): boolean =>
  Option.match(asSchemaMethodCall(node), {
    onNone: () => false,
    onSome: ({ method, args }) => {
      if (!Option.exists(method, (name) => name === "fromJsonString")) return true;
      const [firstArg] = args;
      return isStaticSchemaReference(firstArg) || isNestedStaticSchemaCall(firstArg);
    },
  });

const isImmediatelyInvoked = (node: ESTree.CallExpression): boolean => {
  const parent = asExpression(node.parent) ? unwrapExpression(node.parent) : Option.none();
  return (
    Option.isSome(parent) &&
    parent.value.type === "CallExpression" &&
    unwrapExpression(parent.value.callee).pipe(Option.exists((callee) => callee === node))
  );
};

const messageHigh = (method: string) =>
  `Hoist Schema.${method}(...) to module scope: both the inline schema literal and the compiled function are rebuilt on every call. Move the compiled function to a module-level const.`;

const messageMedium = (method: string) =>
  `Hoist Schema.${method}(...) to module scope: the compiled function is rebuilt on every call. Move it to a module-level const.`;

/**
 * Decide whether an immediately-invoked `Schema.<method>(...)` call should be
 * reported, and at which severity: `high` when its first argument is itself a
 * nested static schema call, `medium` when it is a plain static schema reference.
 */
const reportMessage = (method: string, firstArg: MaybeNode): Option.Option<string> => {
  const high = firstArg !== undefined && isNestedStaticSchemaCall(firstArg);
  if (high) return Option.some(messageHigh(method));
  return isStaticSchemaReference(firstArg) ? Option.some(messageMedium(method)) : Option.none();
};

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Disallow Schema decoder/encoder compiler calls inside function bodies; hoist them to module scope.",
    },
  },
  createOnce(context) {
    let functionDepth = 0;

    const resetFunctionDepth = () => {
      functionDepth = 0;
    };

    const enterFunction = () => {
      functionDepth++;
    };

    const exitFunction = () => {
      functionDepth--;
    };

    return {
      before: resetFunctionDepth,
      FunctionDeclaration: enterFunction,
      "FunctionDeclaration:exit": exitFunction,
      FunctionExpression: enterFunction,
      "FunctionExpression:exit": exitFunction,
      ArrowFunctionExpression: enterFunction,
      "ArrowFunctionExpression:exit": exitFunction,
      CallExpression(node) {
        if (functionDepth === 0) return;

        const message = getSchemaCompilerMethod(node.callee).pipe(
          Option.filter(() => isImmediatelyInvoked(node)),
          Option.flatMap((method) => reportMessage(method, node.arguments[0]))
        );
        if (Option.isNone(message)) return;

        context.report({ node: node.callee, message: message.value });
      },
    };
  },
});
