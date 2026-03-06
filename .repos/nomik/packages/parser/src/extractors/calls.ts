import type Parser from 'tree-sitter';
import { isModuleScopeVariableDeclarator } from './functions.js';
import { isModuleScopeObjectLiteral, resolveFunctionName } from './ast-utils.js';

export interface CallInfo {
    callerName: string;
    calleeName: string;
    receiverName?: string;
    isLocalIdentifier?: boolean;
    line: number;
    column: number;
    isMethodCall: boolean;
    isConstructor: boolean;
}

export type ArrayCallbackAliases = Map<string, string[]>;

/** Extract function calls from the AST — includes obj.method() and config references */
export function extractCalls(tree: Parser.Tree, _filePath: string): CallInfo[] {
    const results: CallInfo[] = [];
    const seen = new Set<string>();
    // Callback aliases stored in arrays:
    // const middleware = [fnA, fnB] then app.use(middleware)
    const arrayCallbackRefs = extractArrayCallbackAliases(tree);

    function push(call: CallInfo): void {
        const key = `${call.callerName}->${call.calleeName}->${call.receiverName ?? ''}`;
        if (!seen.has(key)) {
            seen.add(key);
            results.push(call);
        }
    }

    function visit(
        node: Parser.SyntaxNode,
        currentFunction: string | null,
        currentParamNames: Set<string>,
    ): void {
        let funcName = currentFunction;
        let paramNames = currentParamNames;

        if (isFunctionLike(node) && isTrackedFunctionScope(node)) {
            const name = resolveFunctionName(node);
            if (name) funcName = name;
            paramNames = extractFunctionParamNames(node);
        }

        // Function calls: fn() and obj.method()
        if (node.type === 'call_expression') {
            const caller = funcName ?? '__file__';
            const call = buildCallInfo(node, caller, false);
            if (call) {
                if (!call.isMethodCall && paramNames.has(call.calleeName)) {
                    call.isLocalIdentifier = true;
                }
                push(call);
            }
        }

        // Constructor calls: new Class()
        if (node.type === 'new_expression') {
            const caller = funcName ?? '__file__';
            const call = buildCallInfo(node, caller, true);
            if (call) push(call);
        }

        // Function references in object properties:
        // { someFunction } (shorthand) or { key: someFunction } (identifier as value)
        if (node.type === 'shorthand_property_identifier') {
            const name = node.text;
            if (name && !NOISE.has(name)) {
                const caller = funcName ?? '__file__';
                push({
                    callerName: caller,
                    calleeName: name,
                    line: node.startPosition.row + 1,
                    column: node.startPosition.column,
                    isMethodCall: false,
                    isConstructor: false,
                });
            }
        }

        if (node.type === 'pair') {
            const value = node.childForFieldName('value');
            if (value?.type === 'identifier' && !NOISE.has(value.text)) {
                const caller = funcName ?? '__file__';
                push({
                    callerName: caller,
                    calleeName: value.text,
                    line: value.startPosition.row + 1,
                    column: value.startPosition.column,
                    isMethodCall: false,
                    isConstructor: false,
                });
            }
        }

        // Function references passed as arguments: fn(callback), arr.map(handler)
        // Includes member_expression: router.get('/path', controller.method)
        if (node.type === 'arguments') {
            const callbackContext = isLikelyCallbackArgumentContext(node);
            const dynamicImportThenContext = isDynamicImportThenContext(node);
            for (const arg of node.namedChildren) {
                const refArg = callbackContext ? unwrapReferenceExpression(arg) : arg;
                if (callbackContext && refArg.type === 'identifier' && !NOISE.has(refArg.text)) {
                    const caller = funcName ?? '__file__';
                    push({
                        callerName: caller,
                        calleeName: refArg.text,
                        line: refArg.startPosition.row + 1,
                        column: refArg.startPosition.column,
                        isMethodCall: false,
                        isConstructor: false,
                    });
                    // Resolve array aliases: app.use(sanitizeInputs) => sanitizeQueryParams/sanitizeBodyParams
                    const aliasedCallbacks = arrayCallbackRefs.get(refArg.text);
                    if (aliasedCallbacks) {
                        for (const cbName of aliasedCallbacks) {
                            push({
                                callerName: caller,
                                calleeName: cbName,
                                line: refArg.startPosition.row + 1,
                                column: refArg.startPosition.column,
                                isMethodCall: false,
                                isConstructor: false,
                            });
                        }
                    }
                }
                // member_expression as callback: controller.method, service.handler
                // e.g. router.get('/path', attributeController.getAllSets)
                if (callbackContext && refArg.type === 'member_expression') {
                    const property = refArg.childForFieldName('property');
                    const obj = refArg.childForFieldName('object');
                    if (property && !NOISE.has(property.text)) {
                        const objName = obj?.type === 'identifier' ? obj.text : null;
                        if (!objName || (!NOISE.has(objName) && !OBJ_NOISE.has(objName))) {
                            const caller = funcName ?? '__file__';
                            push({
                                callerName: caller,
                                calleeName: property.text,
                                receiverName: objName ?? undefined,
                                line: refArg.startPosition.row + 1,
                                column: refArg.startPosition.column,
                                isMethodCall: true,
                                isConstructor: false,
                            });
                        }
                    }
                }

                // Dynamic import destructuring:
                // import('./audio').then(({ playMessageSound }) => playMessageSound())
                if (dynamicImportThenContext && (refArg.type === 'arrow_function' || refArg.type === 'function')) {
                    const paramsNode = refArg.childForFieldName('parameters');
                    const firstParam = paramsNode?.namedChildren?.[0];
                    if (firstParam?.type === 'object_pattern') {
                        const names = extractObjectPatternIdentifiers(firstParam);
                        const caller = funcName ?? '__file__';
                        for (const name of names) {
                            if (!name || NOISE.has(name)) continue;
                            push({
                                callerName: caller,
                                calleeName: name,
                                line: firstParam.startPosition.row + 1,
                                column: firstParam.startPosition.column,
                                isMethodCall: false,
                                isConstructor: false,
                            });
                        }
                    }
                }
            }
        }

        // Bug 2: await import() + destructuring: const { foo } = await import('./module')
        if (node.type === 'variable_declarator') {
            const nameNode = node.childForFieldName('name');
            const valueNode = node.childForFieldName('value');
            if (nameNode?.type === 'object_pattern' && valueNode?.type === 'await_expression') {
                const awaitChild = valueNode.namedChildren[0];
                if (awaitChild?.type === 'call_expression') {
                    const importFn = awaitChild.childForFieldName('function');
                    if (importFn?.text === 'import') {
                        const names = extractObjectPatternIdentifiers(nameNode);
                        const caller = funcName ?? '__file__';
                        for (const name of names) {
                            if (!name || NOISE.has(name)) continue;
                            push({
                                callerName: caller,
                                calleeName: name,
                                line: nameNode.startPosition.row + 1,
                                column: nameNode.startPosition.column,
                                isMethodCall: false,
                                isConstructor: false,
                            });
                        }
                    }
                }
            }
        }

        // Bug 3: JSX element usage — <Foo /> or <Foo prop={...}>
        // Only PascalCase names — lowercase = native HTML element (div, span, etc.)
        if (node.type === 'jsx_self_closing_element' || node.type === 'jsx_opening_element') {
            const nameNode = node.childForFieldName('name') ?? node.namedChildren[0];
            if (nameNode) {
                let jsxName: string | undefined;
                if (nameNode.type === 'member_expression') {
                    jsxName = nameNode.childForFieldName('property')?.text;
                } else if (nameNode.type === 'identifier' || nameNode.type === 'jsx_identifier') {
                    jsxName = nameNode.text;
                }
                if (jsxName && /^[A-Z]/.test(jsxName) && !NOISE.has(jsxName)) {
                    push({
                        callerName: funcName ?? '__file__',
                        calleeName: jsxName,
                        line: nameNode.startPosition.row + 1,
                        column: nameNode.startPosition.column,
                        isMethodCall: false,
                        isConstructor: false,
                    });
                }
            }
        }

        for (const child of node.namedChildren) {
            visit(child, funcName, paramNames);
        }
    }

    visit(tree.rootNode, null, new Set());
    return results;
}

/** Extract callback aliases declared as arrays.
 * Example: const sanitizeInputs = [sanitizeQueryParams, sanitizeBodyParams]
 */
export function extractArrayCallbackAliases(tree: Parser.Tree): ArrayCallbackAliases {
    const aliases: ArrayCallbackAliases = new Map();

    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'variable_declarator') {
            const nameNode = node.childForFieldName('name');
            const valueNode = node.childForFieldName('value');
            if (nameNode?.type === 'identifier' && valueNode?.type === 'array') {
                const refs: string[] = [];
                for (const item of valueNode.namedChildren) {
                    if (item.type === 'identifier' && !NOISE.has(item.text)) {
                        refs.push(item.text);
                        continue;
                    }
                    if (item.type === 'member_expression') {
                        const property = item.childForFieldName('property');
                        const obj = item.childForFieldName('object');
                        const objName = obj?.type === 'identifier' ? obj.text : null;
                        if (
                            property &&
                            !NOISE.has(property.text) &&
                            (!objName || (!NOISE.has(objName) && !OBJ_NOISE.has(objName)))
                        ) {
                            refs.push(property.text);
                        }
                    }
                }
                if (refs.length > 0) aliases.set(nameNode.text, refs);
            }
        }
        for (const child of node.namedChildren) {
            visit(child);
        }
    }

    visit(tree.rootNode);
    return aliases;
}

function isLikelyCallbackArgumentContext(argsNode: Parser.SyntaxNode): boolean {
    const parentCall = argsNode.parent;
    if (!parentCall || parentCall.type !== 'call_expression') return false;
    const fn = parentCall.childForFieldName('function');
    if (!fn) return false;

    if (fn.type === 'identifier') {
        return CALLBACK_ARG_CALLEES.has(fn.text);
    }
    if (fn.type === 'member_expression') {
        const property = fn.childForFieldName('property');
        return !!property && CALLBACK_ARG_CALLEES.has(property.text);
    }
    return false;
}

function isDynamicImportThenContext(argsNode: Parser.SyntaxNode): boolean {
    const parentCall = argsNode.parent;
    if (!parentCall || parentCall.type !== 'call_expression') return false;
    const fn = parentCall.childForFieldName('function');
    if (!fn || fn.type !== 'member_expression') return false;
    const property = fn.childForFieldName('property');
    if (!property || property.text !== 'then') return false;
    const object = fn.childForFieldName('object');
    if (!object || object.type !== 'call_expression') return false;
    const importFn = object.childForFieldName('function');
    return !!importFn && importFn.text === 'import';
}

function extractObjectPatternIdentifiers(node: Parser.SyntaxNode): string[] {
    const out: string[] = [];
    const visit = (n: Parser.SyntaxNode): void => {
        if (n.type === 'identifier' || n.type === 'shorthand_property_identifier' || n.type === 'shorthand_property_identifier_pattern') {
            out.push(n.text);
            return;
        }
        const value = n.childForFieldName('value');
        if (value) {
            visit(value);
            return;
        }
        const pattern = n.childForFieldName('pattern');
        if (pattern) {
            visit(pattern);
            return;
        }
        const left = n.childForFieldName('left');
        if (left) {
            visit(left);
            return;
        }
        for (const child of n.namedChildren) visit(child);
    };
    visit(node);
    return [...new Set(out)];
}

function unwrapReferenceExpression(node: Parser.SyntaxNode): Parser.SyntaxNode {
    let current = node;
    while (true) {
        if (
            current.type === 'as_expression'
            || current.type === 'type_assertion'
            || current.type === 'satisfies_expression'
            || current.type === 'non_null_expression'
            || current.type === 'parenthesized_expression'
        ) {
            const next = current.childForFieldName('expression') ?? current.namedChildren[0];
            if (!next || next === current) return current;
            current = next;
            continue;
        }
        return current;
    }
}

/** Ignored names: builtins, stdlib, common constructors */
const NOISE = new Set([
    'require', 'import', 'console', 'JSON', 'Object', 'Array', 'Map', 'Set',
    'Promise', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
    'parseInt', 'parseFloat', 'String', 'Number', 'Boolean', 'Buffer',
    'Symbol', 'Error', 'RegExp', 'Date', 'Math', 'Proxy', 'Reflect',
    'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI',
    'isNaN', 'isFinite', 'eval', 'fetch', 'alert', 'confirm', 'prompt',
]);

const CALLBACK_ARG_CALLEES = new Set([
    // Express/router style callback containers
    'use', 'all', 'get', 'post', 'put', 'patch', 'delete',
    // Event and promise callback containers
    'on', 'once', 'off', 'then', 'catch', 'finally', 'addEventListener',
    // Common JS callback containers
    'map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every',
    'setTimeout', 'setInterval',
]);

/** Node/browser stdlib objects — filter noisy obj.method() calls */
const OBJ_NOISE = new Set([
    'console', 'JSON', 'Object', 'Array', 'Map', 'Set', 'Promise', 'Math',
    'Date', 'RegExp', 'Error', 'Buffer', 'Proxy', 'Reflect',
    'path', 'fs', 'os', 'process', 'child_process', 'util', 'url', 'crypto',
    'http', 'https', 'net', 'stream', 'events', 'zlib',
    'window', 'document', 'navigator', 'location', 'history',
    'localStorage', 'sessionStorage',
]);

function isFunctionLike(node: Parser.SyntaxNode): boolean {
    return [
        'function_declaration',
        'method_definition',
        'arrow_function',
        'function',
        'generator_function_declaration',
    ].includes(node.type);
}

function isTrackedFunctionScope(node: Parser.SyntaxNode): boolean {
    // Keep function-scope tracking aligned with the function extractor
    // to avoid callerName values that cannot be resolved to real symbols.
    if (node.type === 'method_definition' && node.parent?.type === 'object') {
        if (!isModuleScopeObjectLiteral(node.parent)) return false;
    }
    if ((node.type === 'arrow_function' || node.type === 'function') && node.parent?.type === 'pair') {
        const body = node.childForFieldName('body');
        if (node.type === 'arrow_function' && body && body.type !== 'statement_block') return false;
        if (!isModuleScopeObjectLiteral(node.parent.parent)) return false;
    }
    // Aligned with isFunctionLike: nested const/let arrow functions declared
    // inside another function body must NOT create a new caller scope.
    // Otherwise callerName becomes e.g. 'trackPageView' which doesn't exist
    // in funcMap, silently dropping the CALLS edge.
    if ((node.type === 'arrow_function' || node.type === 'function') && node.parent?.type === 'variable_declarator') {
        if (!isModuleScopeVariableDeclarator(node.parent)) return false;
    }
    return true;
}

function extractFunctionParamNames(node: Parser.SyntaxNode): Set<string> {
    const names = new Set<string>();
    const paramsNode = node.childForFieldName('parameters');
    if (!paramsNode) return names;

    const addFromParam = (paramNode: Parser.SyntaxNode): void => {
        if (paramNode.type === 'identifier') {
            names.add(paramNode.text);
            return;
        }
        const pattern = paramNode.childForFieldName('pattern');
        if (pattern?.type === 'identifier') {
            names.add(pattern.text);
            return;
        }
        const left = paramNode.childForFieldName('left');
        if (left?.type === 'identifier') {
            names.add(left.text);
            return;
        }
        const argument = paramNode.childForFieldName('argument');
        if (argument?.type === 'identifier') {
            names.add(argument.text);
        }
    };

    for (const child of paramsNode.namedChildren) {
        addFromParam(child);
    }
    return names;
}

function buildCallInfo(node: Parser.SyntaxNode, callerName: string, isNew: boolean): CallInfo | null {
    const fn = node.childForFieldName('function') ?? node.childForFieldName('constructor');
    if (!fn) return null;

    let calleeName: string;
    let isMethodCall = false;
    let receiverName: string | undefined;

    if (fn.type === 'identifier') {
        calleeName = fn.text;
    } else if (fn.type === 'member_expression') {
        const obj = fn.childForFieldName('object');
        const property = fn.childForFieldName('property');
        if (!property) return null;
        calleeName = property.text;
        isMethodCall = true;
        // Filter stdlib calls: console.log, path.resolve, fs.readFileSync, etc.
        if (obj) {
            const objName = obj.type === 'identifier' ? obj.text : null;
            if (objName && (NOISE.has(objName) || OBJ_NOISE.has(objName))) return null;
            receiverName = objName ?? undefined;
        }
    } else {
        return null;
    }

    if (NOISE.has(calleeName)) return null;
    if (calleeName.startsWith('_') && calleeName.length <= 2) return null;

    return {
        callerName,
        calleeName,
        receiverName,
        line: node.startPosition.row + 1,
        column: node.startPosition.column,
        isMethodCall,
        isConstructor: isNew,
    };
}
