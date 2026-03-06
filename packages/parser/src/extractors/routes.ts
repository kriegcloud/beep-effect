import type Parser from 'tree-sitter';
import type { RouteNode } from '@nomik/core';
import { createNodeId } from '../utils';

export function extractRoutes(tree: Parser.Tree, filePath: string): RouteNode[] {
    const results: RouteNode[] = [];
    const cursor = tree.walk();

    function visit(): void {
        const node = cursor.currentNode;

        const route = tryExpressRoute(node, filePath)
            ?? tryDecoratorRoute(node, filePath);
        if (route) results.push(route);

        if (cursor.gotoFirstChild()) {
            do { visit(); } while (cursor.gotoNextSibling());
            cursor.gotoParent();
        }
    }

    visit();
    return results;
}

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'all'] as const;

function tryExpressRoute(node: Parser.SyntaxNode, filePath: string): RouteNode | null {
    if (node.type !== 'call_expression') return null;

    const fn = node.childForFieldName('function');
    if (!fn || fn.type !== 'member_expression') return null;

    const property = fn.childForFieldName('property');
    if (!property) return null;

    const methodName = property.text.toLowerCase();
    if (!HTTP_METHODS.includes(methodName as typeof HTTP_METHODS[number])) return null;

    const args = node.childForFieldName('arguments');
    if (!args || args.namedChildren.length < 2) return null;

    const pathArg = args.namedChildren[0];
    if (!pathArg) return null;
    const routePath = pathArg.text.replace(/['"]/g, '');

    const lastArg = args.namedChildren[args.namedChildren.length - 1];
    const handlerName = resolveHandlerName(lastArg);

    const middleware = args.namedChildren
        .slice(1, -1)
        .map((a: Parser.SyntaxNode) => a.text)
        .filter((t: string) => t !== undefined);

    const method = methodName.toUpperCase() as RouteNode['method'];

    return {
        id: createNodeId('route', filePath, `${method}:${routePath}`),
        type: 'route',
        method,
        path: routePath,
        handlerName: handlerName ?? 'anonymous',
        filePath,
        middleware,
    };
}

function tryDecoratorRoute(node: Parser.SyntaxNode, filePath: string): RouteNode | null {
    if (node.type !== 'decorator') return null;

    const expr = node.namedChildren[0];
    if (!expr || expr.type !== 'call_expression') return null;

    const fn = expr.childForFieldName('function');
    if (!fn) return null;

    const decoratorName = fn.text.toLowerCase();
    const methodMatch = HTTP_METHODS.find((m) => decoratorName.includes(m));
    if (!methodMatch) return null;

    const args = expr.childForFieldName('arguments');
    const pathArg = args?.namedChildren[0];
    const routePath = pathArg?.text?.replace(/['"]/g, '') ?? '/';

    const sibling = node.nextNamedSibling;
    const handlerName = sibling?.childForFieldName('name')?.text ?? 'anonymous';
    const method = methodMatch.toUpperCase() as RouteNode['method'];

    // Collect Swagger/OpenAPI decorators from siblings
    const swagger = collectSwaggerDecorators(node);

    return {
        id: createNodeId('route', filePath, `${method}:${routePath}`),
        type: 'route',
        method,
        path: routePath,
        handlerName,
        filePath,
        middleware: [],
        ...swagger,
    };
}

const SWAGGER_DECORATORS: Record<string, string> = {
    apitags: 'tags',
    apioperation: 'operation',
    apiresponse: 'response',
    apiokresponse: 'response',
    apicreatedresponse: 'response',
    apibadrequestresponse: 'response',
    apinotfoundresponse: 'response',
    apiunauthorizedresponse: 'response',
    apiforbiddenresponse: 'response',
};

interface SwaggerMeta {
    apiTags?: string[];
    apiSummary?: string;
    apiDescription?: string;
    apiResponseStatus?: number[];
}

function collectSwaggerDecorators(routeDecoratorNode: Parser.SyntaxNode): SwaggerMeta {
    const meta: SwaggerMeta = {};
    const parent = routeDecoratorNode.parent;
    if (!parent) return meta;

    // Scan all decorator siblings on the same method/class member
    for (const child of parent.namedChildren) {
        if (child.type !== 'decorator') continue;

        const expr = child.namedChildren[0];
        if (!expr || expr.type !== 'call_expression') continue;

        const fn = expr.childForFieldName('function');
        if (!fn) continue;

        const name = fn.text.toLowerCase();
        const kind = SWAGGER_DECORATORS[name];
        if (!kind) continue;

        const args = expr.childForFieldName('arguments');
        if (!args) continue;

        if (kind === 'tags') {
            const tags: string[] = [];
            for (const arg of args.namedChildren) {
                if (arg.type === 'string' || arg.type === 'template_string') {
                    tags.push(arg.text.replace(/^['"`]|['"`]$/g, ''));
                }
            }
            if (tags.length > 0) meta.apiTags = tags;
        }

        if (kind === 'operation') {
            const firstArg = args.namedChildren[0];
            if (firstArg?.type === 'object') {
                for (const prop of firstArg.namedChildren) {
                    if (prop.type !== 'pair') continue;
                    const key = prop.childForFieldName('key')?.text?.replace(/^['"`]|['"`]$/g, '');
                    const val = prop.childForFieldName('value')?.text?.replace(/^['"`]|['"`]$/g, '');
                    if (key === 'summary' && val) meta.apiSummary = val;
                    if (key === 'description' && val) meta.apiDescription = val;
                }
            }
        }

        if (kind === 'response') {
            const firstArg = args.namedChildren[0];
            if (firstArg?.type === 'object') {
                for (const prop of firstArg.namedChildren) {
                    if (prop.type !== 'pair') continue;
                    const key = prop.childForFieldName('key')?.text?.replace(/^['"`]|['"`]$/g, '');
                    const val = prop.childForFieldName('value')?.text;
                    if (key === 'status' && val) {
                        const num = parseInt(val, 10);
                        if (!isNaN(num)) {
                            meta.apiResponseStatus ??= [];
                            if (!meta.apiResponseStatus.includes(num)) meta.apiResponseStatus.push(num);
                        }
                    }
                }
            }
            // @ApiOkResponse() → 200, @ApiCreatedResponse() → 201, etc.
            const statusFromName = inferStatusFromDecoratorName(fn.text);
            if (statusFromName) {
                meta.apiResponseStatus ??= [];
                if (!meta.apiResponseStatus.includes(statusFromName)) meta.apiResponseStatus.push(statusFromName);
            }
        }
    }

    return meta;
}

function inferStatusFromDecoratorName(name: string): number | null {
    const lower = name.toLowerCase();
    if (lower.includes('okresponse')) return 200;
    if (lower.includes('createdresponse')) return 201;
    if (lower.includes('badrequestresponse')) return 400;
    if (lower.includes('unauthorizedresponse')) return 401;
    if (lower.includes('forbiddenresponse')) return 403;
    if (lower.includes('notfoundresponse')) return 404;
    return null;
}

function resolveHandlerName(node: Parser.SyntaxNode | undefined): string | null {
    if (!node) return null;
    if (node.type === 'identifier') return node.text;
    if (node.type === 'member_expression') return node.text;
    if (node.type === 'arrow_function' || node.type === 'function') {
        // Named function expression: function myHandler(req, res) { ... }
        const name = node.childForFieldName('name')?.text;
        if (name) return name;
        // Check if this arrow/function is assigned to a variable: const handler = async (req, res) => {}
        const parent = node.parent;
        if (parent?.type === 'variable_declarator') {
            return parent.childForFieldName('name')?.text ?? null;
        }
        return null;
    }
    // Async wrapper: the node might be an await_expression wrapping a call
    if (node.type === 'call_expression') {
        const fn = node.childForFieldName('function');
        if (fn?.type === 'identifier') return fn.text;
        if (fn?.type === 'member_expression') return fn.text;
    }
    return null;
}
