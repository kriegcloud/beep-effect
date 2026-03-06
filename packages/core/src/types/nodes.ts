export interface FileNode {
    id: string;
    type: 'file';
    path: string;
    language: string;
    hash: string;
    size: number;
    lineCount: number;
    lastParsed: string;
}

export interface FunctionNode {
    id: string;
    type: 'function';
    name: string;
    filePath: string;
    startLine: number;
    endLine: number;
    params: ParameterInfo[];
    returnType?: string;
    isAsync: boolean;
    isExported: boolean;
    isGenerator: boolean;
    decorators: string[];
    confidence: number;
    bodyHash?: string;
}

export interface ClassNode {
    id: string;
    type: 'class';
    name: string;
    filePath: string;
    startLine: number;
    endLine: number;
    isExported: boolean;
    isAbstract: boolean;
    superClass?: string;
    interfaces: string[];
    decorators: string[];
    methods: string[];
    properties: string[];
    bodyHash?: string;
}

export interface VariableNode {
    id: string;
    type: 'variable';
    name: string;
    filePath: string;
    line: number;
    kind: 'const' | 'let' | 'var';
    isExported: boolean;
    valueType?: string;
}

export interface ModuleNode {
    id: string;
    type: 'module';
    name: string;
    path: string;
    moduleType: 'file' | 'package' | 'external';
}

export interface RouteNode {
    id: string;
    type: 'route';
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'ALL';
    path: string;
    handlerName: string;
    filePath: string;
    middleware: string[];
    apiTags?: string[];
    apiSummary?: string;
    apiDescription?: string;
    apiResponseStatus?: number[];
}

export interface DBTableNode {
    id: string;
    type: 'db_table';
    name: string;
    schema?: string;
    operations: Array<'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'>;
}

export interface DBColumnNode {
    id: string;
    type: 'db_column';
    name: string;
    tableName: string;
    dataType?: string;
    nullable?: boolean;
}

export interface ExternalAPINode {
    id: string;
    type: 'external_api';
    name: string;
    baseUrl?: string;
    methods: string[];
}

export interface CronJobNode {
    id: string;
    type: 'cron_job';
    name: string;
    schedule: string;
    handlerName: string;
    filePath: string;
}

export interface EventNode {
    id: string;
    type: 'event';
    name: string;
    eventKind: 'emit' | 'listen';
    filePath: string;
    namespace?: string;
    room?: string;
}

export interface EnvVarNode {
    id: string;
    type: 'env_var';
    name: string;
    required: boolean;
    defaultValue?: string;
}

export interface QueueJobNode {
    id: string;
    type: 'queue_job';
    name: string;
    queueName: string;
    filePath: string;
    jobKind: 'producer' | 'consumer';
}

export interface MetricNode {
    id: string;
    type: 'metric';
    name: string;
    metricType: 'counter' | 'gauge' | 'histogram' | 'summary' | 'unknown';
    help?: string;
    filePath: string;
}

export interface SpanNode {
    id: string;
    type: 'span';
    name: string;
    spanKind?: 'server' | 'client' | 'producer' | 'consumer' | 'internal';
    attributes?: string[];
    filePath: string;
}

export interface TopicNode {
    id: string;
    type: 'topic';
    name: string;
    broker: 'kafka' | 'rabbitmq' | 'nats' | 'sqs' | 'sns' | 'pubsub' | 'unknown';
    topicKind: 'producer' | 'consumer';
    filePath: string;
}

export interface SecurityIssueNode {
    id: string;
    type: 'security_issue';
    name: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'hardcoded_secret' | 'weak_crypto' | 'insecure_config' | 'exposed_credential';
    filePath: string;
    line: number;
    description: string;
}

/** Project node: isolates data by project in the graph */
export interface ProjectNode {
    id: string;
    type: 'project';
    name: string;
    rootPath: string;
    createdAt: string;
    lastScanAt?: string;
}

export interface ParameterInfo {
    name: string;
    type?: string;
    optional: boolean;
    defaultValue?: string;
}

export type GraphNode =
    | FileNode
    | FunctionNode
    | ClassNode
    | VariableNode
    | ModuleNode
    | RouteNode
    | DBTableNode
    | DBColumnNode
    | ExternalAPINode
    | CronJobNode
    | EventNode
    | EnvVarNode
    | QueueJobNode
    | MetricNode
    | SpanNode
    | TopicNode
    | SecurityIssueNode;

export type NodeType = GraphNode['type'];
