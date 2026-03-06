import type { CallsEdge, ClassNode, ExtendsEdge, HandlesEdge, ImplementsEdge } from '@nomik/core';
import type { GraphNode, RouteNode } from '@nomik/core';


/** Resolve intra-file EXTENDS edges (class inheritance) */
export function resolveExtendsEdges(
    classes: ClassNode[],
    _funcMap: Map<string, string>,
    _filePath: string,
): ExtendsEdge[] {
    const edges: ExtendsEdge[] = [];
    const classMap = new Map<string, string>();
    for (const cls of classes) {
        classMap.set(cls.name, cls.id);
    }

    for (const cls of classes) {
        if (!cls.superClass) continue;
        const parentId = classMap.get(cls.superClass);
        if (!parentId) continue;
        edges.push({
            id: `${cls.id}->extends->${parentId}`,
            type: 'EXTENDS' as const,
            sourceId: cls.id,
            targetId: parentId,
            confidence: 1.0,
        });
    }
    return edges;
}

/** Resolve intra-file IMPLEMENTS edges (interfaces) */
export function resolveImplementsEdges(
    classes: ClassNode[],
    _filePath: string,
): ImplementsEdge[] {
    const edges: ImplementsEdge[] = [];
    const classMap = new Map<string, string>();
    for (const cls of classes) {
        classMap.set(cls.name, cls.id);
    }

    for (const cls of classes) {
        for (const iface of cls.interfaces) {
            const targetId = classMap.get(iface);
            if (!targetId) continue;
            edges.push({
                id: `${cls.id}->implements->${targetId}`,
                type: 'IMPLEMENTS' as const,
                sourceId: cls.id,
                targetId,
                confidence: 1.0,
            });
        }
    }
    return edges;
}

/** Resolve HANDLES edges: Route → handler function (intra-file)
 *  Creates a semantic link between a Route node and the function that handles it
 *  Handles local handlers and member_expression (controller.method)
 */
export function resolveRouteHandlesEdges(
    routes: GraphNode[],
    funcMap: Map<string, string>,
): HandlesEdge[] {
    const edges: HandlesEdge[] = [];
    for (const node of routes) {
        if (node.type !== 'route') continue;
        const route = node as RouteNode;
        if (!route.handlerName || route.handlerName === 'anonymous') continue;

        const methodName = extractHandlerMethodName(route.handlerName);
        const targetId = funcMap.get(methodName);
        if (targetId) {
            edges.push({
                id: `${route.id}->handles->${targetId}`,
                type: 'HANDLES' as const,
                sourceId: route.id,
                targetId,
                confidence: 0.9,
                middleware: route.middleware ?? [],
            });
        }
    }
    return edges;
}

/** Resolve cross-file HANDLES edges: Route → Function in another file
 *  Typical case: attributeRoutes.ts contains router.get('/sets', attributeController.getAllSets)
 *  but getAllSets is defined in attributeController.ts
 */
export function resolveCrossFileHandlesEdges(
    nodes: GraphNode[],
    localIds: Set<string>,
    multiMap: Map<string, string[]>,
): HandlesEdge[] {
    const edges: HandlesEdge[] = [];
    const seen = new Set<string>();

    for (const node of nodes) {
        if (node.type !== 'route') continue;
        const route = node as RouteNode;
        if (!route.handlerName || route.handlerName === 'anonymous') continue;

        const methodName = extractHandlerMethodName(route.handlerName);
        const candidateIds = multiMap.get(methodName) ?? [];

        const remoteIds = candidateIds.filter((id) => !localIds.has(id));
        for (const targetId of remoteIds) {
            const key = `${route.id}->${targetId}`;
            if (seen.has(key)) continue;
            seen.add(key);

            edges.push({
                id: `${route.id}->handles->${targetId}`,
                type: 'HANDLES' as const,
                sourceId: route.id,
                targetId,
                confidence: 0.85,
                middleware: route.middleware ?? [],
            });
        }
    }
    return edges;
}

export function extractHandlerMethodName(handlerName: string): string {
    return handlerName.includes('.')
        ? handlerName.split('.').pop()!
        : handlerName;
}


/**
 * File-based framework entry point patterns.
 * Only used for cases where the file path convention is strong AND specific
 * function names are mandated by the framework API.
 *
 * Python/Django class methods (get, post, save, clean, etc.) are NOT listed
 * here — they are already excluded from dead-code detection via the
 * cls.methods check in the Cypher query. Decorator-based detection below
 * handles @property, @receiver, @register, @task, etc. dynamically.
 */
const FRAMEWORK_ENTRY_PATTERNS: Array<{
    filePattern: RegExp;
    functionNames: string[];
}> = [
        // ── JavaScript / TypeScript ──────────────────────────────────────
        { filePattern: /[\\/]middleware\.(ts|js|tsx|jsx)$/, functionNames: ['middleware'] },
        { filePattern: /[\\/]route\.(ts|js|tsx|jsx)$/, functionNames: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] },
        { filePattern: /[\\/]page\.(ts|js|tsx|jsx)$/, functionNames: ['default', 'Page'] },
        { filePattern: /[\\/]layout\.(ts|js|tsx|jsx)$/, functionNames: ['default', 'Layout', 'RootLayout'] },
        { filePattern: /[\\/](loading|error|not-found|global-error)\.(ts|js|tsx|jsx)$/, functionNames: ['default'] },
        { filePattern: /[\\/]next\.config\.(js|mjs|ts)$/, functionNames: ['rewrites', 'redirects', 'headers'] },
        { filePattern: /[\\/]plugins[\\/]/, functionNames: ['default'] },
        { filePattern: /[\\/](app|server|index)\.(ts|js)$/, functionNames: ['default', 'app', 'server'] },

        // ── Python — minimal convention-mandated patterns only ───────────
        // Django template tags: every public function IS a tag/filter (convention)
        { filePattern: /[\\/]templatetags[\\/][^/\\]+\.py$/, functionNames: ['*'] },
        // Django management commands: framework calls handle() / add_arguments()
        { filePattern: /[\\/]management[\\/]commands[\\/]/, functionNames: ['handle', 'add_arguments'] },
        // Django AppConfig: framework calls ready() at startup
        { filePattern: /[\\/]apps\.py$/, functionNames: ['ready'] },
        // Django entry point
        { filePattern: /[\\/]manage\.py$/, functionNames: ['main'] },
        // pytest: every function in conftest.py is a fixture (convention)
        { filePattern: /[\\/]conftest\.py$/, functionNames: ['*'] },
        // WSGI/ASGI entry
        { filePattern: /[\\/](wsgi|asgi)\.py$/, functionNames: ['application'] },
    ];

/**
 * Detect if a Python decorator indicates the function is registered with
 * a framework (and therefore auto-invoked at runtime).
 *
 * This is intentionally pattern-based and NOT hardcoded to specific
 * framework names — it detects registration semantics generically.
 */
function isPythonRegistrationDecorator(decorator: string): boolean {
    // @property and property descriptors
    if (decorator === 'property' || decorator === 'cached_property') return true;
    if (/\.(setter|getter|deleter)$/.test(decorator)) return true;

    // Signal/event registration: @receiver(...), @<name>.connect
    if (decorator.startsWith('receiver')) return true;

    // Template tag/filter/admin registration: @register.filter, @register.simple_tag, @admin.register
    if (/^register\b/.test(decorator)) return true;

    // Route registration: @app.route, @router.get, @bp.post (any .route/.get/.post/.put/.delete/.patch)
    if (/\.(route|get|post|put|delete|patch|head|options|websocket)\b/.test(decorator)) return true;

    // Task registration: @task, @shared_task, @periodic_task, @app.task
    if (/^(task|shared_task|periodic_task)\b/.test(decorator)) return true;
    if (/\.task\b/.test(decorator)) return true;

    // View decorators that wrap entry points: @api_view, @action, @require_http_methods
    if (/^(api_view|action|require_http_methods|require_GET|require_POST|require_safe)\b/.test(decorator)) return true;

    return false;
}

/** Create File → CALLS → Function edges for framework-invoked entry points.
 *  Prevents framework entry points from being flagged as dead code.
 */
export function resolveFrameworkEntryEdges(
    fileNode: { id: string; path: string },
    functions: { id: string; name: string; decorators?: string[]; params?: Array<{ name: string }> }[],
): CallsEdge[] {
    const edges: CallsEdge[] = [];
    const seen = new Set<string>();

    function addEdge(fnId: string, confidence: number): void {
        const edgeId = `${fileNode.id}->framework->${fnId}`;
        if (seen.has(edgeId)) return;
        seen.add(edgeId);
        edges.push({
            id: edgeId,
            type: 'CALLS' as const,
            sourceId: fileNode.id,
            targetId: fnId,
            confidence,
            line: 0,
        });
    }

    for (const pattern of FRAMEWORK_ENTRY_PATTERNS) {
        if (!pattern.filePattern.test(fileNode.path)) continue;
        const isWildcard = pattern.functionNames.length === 1 && pattern.functionNames[0] === '*';

        for (const fn of functions) {
            if (!isWildcard && !pattern.functionNames.includes(fn.name)) continue;
            if (isWildcard && fn.name.startsWith('_') && !fn.name.startsWith('__')) continue;
            addEdge(fn.id, 0.95);
        }
    }

    if (fileNode.path.endsWith('.py')) {
        for (const fn of functions) {
            if (fn.name.startsWith('__') && fn.name.endsWith('__')) {
                addEdge(fn.id, 0.95);
                continue;
            }

            if (fn.decorators?.some(isPythonRegistrationDecorator)) {
                addEdge(fn.id, 0.90);
                continue;
            }

            const firstParam = fn.params?.[0]?.name;
            if (firstParam === 'request' || firstParam === 'req') {
                addEdge(fn.id, 0.80);
            }
        }
    }

    return edges;
}
