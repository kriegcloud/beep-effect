import Parser from 'tree-sitter';
import type { GraphNode, GraphEdge, TopicNode, ProducesMessageEdge, ConsumesMessageEdge } from '@nomik/core';
import type { ImportInfo } from './imports.js';
import { createNodeId } from '../utils.js';
import { findEnclosingFunctionName, extractFirstStringArg, extractObjectProperty } from './ast-utils.js';

// ────────────────────────────────────────────────────────────────────────
// Message Broker Detection — import-aware
//
// Detects:
//   - KafkaJS: producer.send({ topic }), consumer.subscribe({ topic })
//   - amqplib: channel.publish(exchange, routingKey), channel.consume(queue)
//   - NATS: nc.publish(subject), nc.subscribe(subject)
//   - AWS SQS/SNS: SendMessageCommand, PublishCommand
//   - Google PubSub: topic.publish(), subscription.on('message')
//
// Creates: TopicNode + PRODUCES_MESSAGE / CONSUMES_MESSAGE edges
// ────────────────────────────────────────────────────────────────────────

export interface MessageOpInfo {
    callerName: string;
    topicName: string;
    broker: TopicNode['broker'];
    kind: 'producer' | 'consumer';
    line: number;
}

const KAFKA_PACKAGES = new Set(['kafkajs', 'kafka-node', '@confluentinc/kafka-javascript']);
const AMQP_PACKAGES = new Set(['amqplib', 'amqp-connection-manager', 'rascal']);
const NATS_PACKAGES = new Set(['nats', 'nats.ws', '@nats-io/nats-core']);
const AWS_SQS_PACKAGES = new Set(['@aws-sdk/client-sqs', 'aws-sdk']);
const AWS_SNS_PACKAGES = new Set(['@aws-sdk/client-sns']);
const PUBSUB_PACKAGES = new Set(['@google-cloud/pubsub']);

const ALL_BROKER_PACKAGES = new Map<string, TopicNode['broker']>();
for (const p of KAFKA_PACKAGES) ALL_BROKER_PACKAGES.set(p, 'kafka');
for (const p of AMQP_PACKAGES) ALL_BROKER_PACKAGES.set(p, 'rabbitmq');
for (const p of NATS_PACKAGES) ALL_BROKER_PACKAGES.set(p, 'nats');
for (const p of AWS_SQS_PACKAGES) ALL_BROKER_PACKAGES.set(p, 'sqs');
for (const p of AWS_SNS_PACKAGES) ALL_BROKER_PACKAGES.set(p, 'sns');
for (const p of PUBSUB_PACKAGES) ALL_BROKER_PACKAGES.set(p, 'pubsub');

const PRODUCE_METHODS = new Set(['send', 'sendBatch', 'publish', 'sendMessage', 'assertQueue']);
const CONSUME_METHODS = new Set(['subscribe', 'consume', 'on', 'run', 'receiveMessage']);


export function buildBrokerClientIdentifiers(imports: ImportInfo[]): { ids: Set<string>; brokerMap: Map<string, TopicNode['broker']> } {
    const ids = new Set<string>();
    const brokerMap = new Map<string, TopicNode['broker']>();
    for (const imp of imports) {
        const source = imp.source.trim();
        const broker = ALL_BROKER_PACKAGES.get(source);
        if (!broker) continue;
        for (const spec of imp.specifiers) {
            ids.add(spec);
            brokerMap.set(spec, broker);
        }
        const lastSegment = source.split('/').pop()!;
        ids.add(lastSegment);
        brokerMap.set(lastSegment, broker);
    }
    return { ids, brokerMap };
}


export function extractMessageOps(
    tree: Parser.Tree,
    _filePath: string,
    clientIds: Set<string>,
    brokerMap: Map<string, TopicNode['broker']>,
): MessageOpInfo[] {
    if (clientIds.size === 0) return [];

    // Resolve variable assignments: const producer = kafka.producer()
    const resolvedIds = new Set(clientIds);
    const resolvedBrokerMap = new Map(brokerMap);
    resolveBrokerInstances(tree.rootNode, clientIds, brokerMap, resolvedIds, resolvedBrokerMap);

    const ops: MessageOpInfo[] = [];

    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'call_expression') {
            const info = parseBrokerCall(node, resolvedIds, resolvedBrokerMap);
            if (info) ops.push(info);
        }
        // Detect new_expression: new SendMessageCommand({ QueueUrl, ... })
        if (node.type === 'new_expression') {
            const info = parseAWSCommand(node, resolvedIds, resolvedBrokerMap);
            if (info) ops.push(info);
        }
        for (const child of node.children) visit(child);
    }

    visit(tree.rootNode);
    return ops;
}

/** Resolve broker factory calls: const kafka = new Kafka(), const producer = kafka.producer() */
function resolveBrokerInstances(
    root: Parser.SyntaxNode,
    importedIds: Set<string>,
    brokerMap: Map<string, TopicNode['broker']>,
    resolvedIds: Set<string>,
    resolvedBrokerMap: Map<string, TopicNode['broker']>,
): void {
    function tryResolve(node: Parser.SyntaxNode): void {
        if (node.type === 'variable_declarator') {
            const nameNode = node.childForFieldName('name');
            const valueNode = node.childForFieldName('value');
            if (nameNode && valueNode) {
                // new Kafka({ ... }), new SQSClient({ ... })
                if (valueNode.type === 'new_expression') {
                    const ctor = valueNode.childForFieldName('constructor');
                    if (ctor && (importedIds.has(ctor.text) || resolvedIds.has(ctor.text))) {
                        resolvedIds.add(nameNode.text);
                        const broker = brokerMap.get(ctor.text) ?? resolvedBrokerMap.get(ctor.text);
                        if (broker) resolvedBrokerMap.set(nameNode.text, broker);
                    }
                }
                // kafka.producer(), kafka.consumer(), channel.createChannel()
                if (valueNode.type === 'call_expression') {
                    const fn = valueNode.childForFieldName('function');
                    if (fn?.type === 'member_expression') {
                        const obj = fn.childForFieldName('object');
                        if (obj && (importedIds.has(obj.text) || resolvedIds.has(obj.text))) {
                            resolvedIds.add(nameNode.text);
                            const broker = brokerMap.get(obj.text) ?? resolvedBrokerMap.get(obj.text);
                            if (broker) resolvedBrokerMap.set(nameNode.text, broker);
                        }
                    }
                    if (fn?.type === 'identifier' && (importedIds.has(fn.text) || resolvedIds.has(fn.text))) {
                        resolvedIds.add(nameNode.text);
                        const broker = brokerMap.get(fn.text) ?? resolvedBrokerMap.get(fn.text);
                        if (broker) resolvedBrokerMap.set(nameNode.text, broker);
                    }
                }
                // await expressions wrapping calls
                if (valueNode.type === 'await_expression') {
                    const inner = valueNode.namedChildren[0];
                    if (inner?.type === 'call_expression') {
                        const fn = inner.childForFieldName('function');
                        if (fn?.type === 'member_expression') {
                            const obj = fn.childForFieldName('object');
                            if (obj && (importedIds.has(obj.text) || resolvedIds.has(obj.text))) {
                                resolvedIds.add(nameNode.text);
                                const broker = brokerMap.get(obj.text) ?? resolvedBrokerMap.get(obj.text);
                                if (broker) resolvedBrokerMap.set(nameNode.text, broker);
                            }
                        }
                    }
                }
            }
        }
        for (const child of node.children) tryResolve(child);
    }
    // Two passes to handle declaration order (new Kafka first, then kafka.producer())
    tryResolve(root);
    tryResolve(root);
}

function parseBrokerCall(
    callNode: Parser.SyntaxNode,
    clientIds: Set<string>,
    brokerMap: Map<string, TopicNode['broker']>,
): MessageOpInfo | null {
    const fn = callNode.childForFieldName('function');
    if (!fn || fn.type !== 'member_expression') return null;

    const obj = fn.childForFieldName('object');
    const prop = fn.childForFieldName('property');
    if (!obj || !prop) return null;
    if (!clientIds.has(obj.text)) return null;

    const method = prop.text;
    const broker = brokerMap.get(obj.text) ?? 'unknown';
    const callerName = findEnclosingFunctionName(callNode) ?? '__file__';

    // Kafka: producer.send({ topic: 'name' })
    if (PRODUCE_METHODS.has(method)) {
        const topicName = extractTopicFromArgs(callNode) ?? extractFirstStringArg(callNode);
        if (topicName) {
            return { callerName, topicName, broker, kind: 'producer', line: callNode.startPosition.row + 1 };
        }
    }

    // consumer.subscribe({ topic: 'name' }), consumer.run({ ... })
    if (CONSUME_METHODS.has(method)) {
        const topicName = extractTopicFromArgs(callNode) ?? extractFirstStringArg(callNode);
        if (topicName) {
            return { callerName, topicName, broker, kind: 'consumer', line: callNode.startPosition.row + 1 };
        }
    }

    // NATS: nc.publish('subject', ...), nc.subscribe('subject')
    if ((method === 'publish' || method === 'subscribe') && broker === 'nats') {
        const topicName = extractFirstStringArg(callNode);
        if (topicName) {
            return {
                callerName, topicName, broker,
                kind: method === 'publish' ? 'producer' : 'consumer',
                line: callNode.startPosition.row + 1,
            };
        }
    }

    // amqplib: channel.sendToQueue('queue', ...), channel.publish('exchange', 'key', ...)
    if (method === 'sendToQueue' && broker === 'rabbitmq') {
        const topicName = extractFirstStringArg(callNode);
        if (topicName) {
            return { callerName, topicName, broker, kind: 'producer', line: callNode.startPosition.row + 1 };
        }
    }

    return null;
}

/** AWS SDK: new SendMessageCommand({ QueueUrl: '...' }) */
function parseAWSCommand(
    node: Parser.SyntaxNode,
    clientIds: Set<string>,
    brokerMap: Map<string, TopicNode['broker']>,
): MessageOpInfo | null {
    const ctor = node.childForFieldName('constructor');
    if (!ctor || !clientIds.has(ctor.text)) return null;

    const isProducer = ctor.text === 'SendMessageCommand' || ctor.text === 'PublishCommand'
        || ctor.text === 'SendMessageBatchCommand';
    const isConsumer = ctor.text === 'ReceiveMessageCommand';
    if (!isProducer && !isConsumer) return null;

    const args = node.childForFieldName('arguments');
    const firstArg = args?.namedChildren[0];
    let topicName: string | null = null;
    if (firstArg?.type === 'object') {
        topicName = extractObjectProperty(firstArg, 'QueueUrl')
            ?? extractObjectProperty(firstArg, 'TopicArn')
            ?? extractObjectProperty(firstArg, 'TargetArn');
    }

    if (!topicName) return null;
    const broker = brokerMap.get(ctor.text) ?? (ctor.text.includes('Publish') ? 'sns' : 'sqs');
    const callerName = findEnclosingFunctionName(node) ?? '__file__';

    return {
        callerName,
        topicName,
        broker,
        kind: isProducer ? 'producer' : 'consumer',
        line: node.startPosition.row + 1,
    };
}

/** Extract 'topic' property from first object arg: producer.send({ topic: 'name' }) */
function extractTopicFromArgs(callNode: Parser.SyntaxNode): string | null {
    const args = callNode.childForFieldName('arguments');
    const firstArg = args?.namedChildren[0];
    if (firstArg?.type === 'object') {
        return extractObjectProperty(firstArg, 'topic')
            ?? extractObjectProperty(firstArg, 'queue')
            ?? extractObjectProperty(firstArg, 'subject');
    }
    return null;
}

export function buildMessageNodesAndEdges(
    ops: MessageOpInfo[],
    funcMap: Map<string, string>,
    fileId: string,
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodes = new Set<string>();
    const seenEdges = new Set<string>();

    for (const op of ops) {
        const topicNodeId = createNodeId('topic', filePath, `${op.broker}:${op.topicName}`);

        if (!seenNodes.has(topicNodeId)) {
            seenNodes.add(topicNodeId);
            const topicNode: TopicNode = {
                id: topicNodeId,
                type: 'topic',
                name: op.topicName,
                broker: op.broker,
                topicKind: op.kind,
                filePath,
            };
            nodes.push(topicNode);
        }

        const sourceId = op.callerName === '__file__'
            ? fileId
            : funcMap.get(op.callerName) ?? fileId;

        if (op.kind === 'producer') {
            const edgeKey = `${sourceId}->produces_message->${topicNodeId}`;
            if (!seenEdges.has(edgeKey)) {
                seenEdges.add(edgeKey);
                const edge: ProducesMessageEdge = {
                    id: edgeKey,
                    type: 'PRODUCES_MESSAGE',
                    sourceId,
                    targetId: topicNodeId,
                    confidence: 0.85,
                    topicName: op.topicName,
                };
                edges.push(edge);
            }
        } else {
            const edgeKey = `${sourceId}->consumes_message->${topicNodeId}`;
            if (!seenEdges.has(edgeKey)) {
                seenEdges.add(edgeKey);
                const edge: ConsumesMessageEdge = {
                    id: edgeKey,
                    type: 'CONSUMES_MESSAGE',
                    sourceId,
                    targetId: topicNodeId,
                    confidence: 0.85,
                    topicName: op.topicName,
                };
                edges.push(edge);
            }
        }
    }

    return { nodes, edges };
}
