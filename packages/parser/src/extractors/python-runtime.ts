import type { GraphNode, GraphEdge } from '@nomik/core';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// Python Runtime Tracking (regex-based)
//
// Extends SRE tracking to Python codebases:
//   - Redis: redis.Redis(), aioredis operations
//   - Celery: @app.task, app.send_task(), .delay(), .apply_async()
//   - Prometheus: prometheus_client Counter/Gauge/Histogram/Summary
//   - OpenTelemetry: opentelemetry.trace tracer.start_span()
//   - Message brokers: confluent_kafka, pika (RabbitMQ), nats
//
// Creates: various node types + edges
// ────────────────────────────────────────────────────────────────────────

export interface PythonRedisOp {
    method: string;
    key: string | null;
    line: number;
    kind: 'read' | 'write';
}

export interface PythonCeleryTask {
    name: string;
    kind: 'define' | 'call';
    line: number;
}

export interface PythonMetricDef {
    name: string;
    metricType: 'counter' | 'gauge' | 'histogram' | 'summary' | 'unknown';
    help: string;
    line: number;
}

export interface PythonSpanDef {
    name: string;
    line: number;
}

export interface PythonBrokerOp {
    topic: string;
    broker: 'kafka' | 'rabbitmq' | 'nats' | 'unknown';
    kind: 'producer' | 'consumer';
    line: number;
}

const REDIS_READ_METHODS = new Set(['get', 'mget', 'hget', 'hgetall', 'lrange', 'smembers', 'zrange', 'exists', 'ttl', 'keys', 'scan']);

export function extractPythonRedisOps(content: string): PythonRedisOp[] {
    const ops: PythonRedisOp[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        // Match: redis_client.get('key'), r.set('key', 'value'), await redis.hget(...)
        const match = line.match(/\.\s*(get|mget|hget|hgetall|lrange|smembers|zrange|exists|ttl|keys|scan|set|mset|hset|lpush|rpush|sadd|zadd|delete|expire|incr|decr|setex|publish)\s*\(/);
        if (match) {
            const method = match[1]!;
            const keyMatch = line.match(new RegExp(`${method}\\s*\\(\\s*['"]([^'"]+)['"']`));
            ops.push({
                method,
                key: keyMatch?.[1] ?? null,
                line: i + 1,
                kind: REDIS_READ_METHODS.has(method) ? 'read' : 'write',
            });
        }
    }

    return ops;
}

export function extractPythonCeleryTasks(content: string): PythonCeleryTask[] {
    const tasks: PythonCeleryTask[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;

        // @app.task / @shared_task / @celery.task
        if (line.match(/@(?:(?:app|celery)\.task|shared_task)\b/)) {
            // Next non-empty line should be the function def
            for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
                const defMatch = lines[j]!.match(/def\s+(\w+)/);
                if (defMatch) {
                    tasks.push({ name: defMatch[1]!, kind: 'define', line: i + 1 });
                    break;
                }
            }
        }

        // task.delay(...), task.apply_async(...), send_task('name')
        const callMatch = line.match(/(\w+)\.(?:delay|apply_async)\s*\(/);
        if (callMatch) {
            tasks.push({ name: callMatch[1]!, kind: 'call', line: i + 1 });
        }

        const sendMatch = line.match(/send_task\s*\(\s*['"]([^'"]+)['"]/);
        if (sendMatch) {
            tasks.push({ name: sendMatch[1]!, kind: 'call', line: i + 1 });
        }
    }

    return tasks;
}

export function extractPythonMetrics(content: string): PythonMetricDef[] {
    const metrics: PythonMetricDef[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        // Counter('name', 'help'), Gauge('name', 'help'), Histogram('name', 'help'), Summary('name', 'help')
        const match = line.match(/(Counter|Gauge|Histogram|Summary)\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/);
        if (match) {
            const typeStr = match[1]!.toLowerCase();
            const metricType = (typeStr === 'counter' || typeStr === 'gauge' || typeStr === 'histogram' || typeStr === 'summary')
                ? typeStr as 'counter' | 'gauge' | 'histogram' | 'summary'
                : 'unknown' as const;
            metrics.push({
                name: match[2]!,
                metricType,
                help: match[3]!,
                line: i + 1,
            });
        }
    }

    return metrics;
}

export function extractPythonSpans(content: string): PythonSpanDef[] {
    const spans: PythonSpanDef[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        // tracer.start_span('name'), tracer.start_as_current_span('name')
        const match = line.match(/\.start_(?:span|as_current_span)\s*\(\s*['"]([^'"]+)['"]/);
        if (match) {
            spans.push({ name: match[1]!, line: i + 1 });
        }
    }

    return spans;
}

export function extractPythonBrokerOps(content: string): PythonBrokerOp[] {
    const ops: PythonBrokerOp[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;

        // Kafka: producer.produce(topic='...'), producer.send('topic', ...)
        const kafkaProduce = line.match(/\.(?:produce|send)\s*\(\s*(?:topic\s*=\s*)?['"]([^'"]+)['"]/);
        if (kafkaProduce && (content.includes('confluent_kafka') || content.includes('kafka'))) {
            ops.push({ topic: kafkaProduce[1]!, broker: 'kafka', kind: 'producer', line: i + 1 });
        }

        // Kafka: consumer.subscribe(['topic'])
        const kafkaSubscribe = line.match(/\.subscribe\s*\(\s*\[?\s*['"]([^'"]+)['"]/);
        if (kafkaSubscribe && (content.includes('confluent_kafka') || content.includes('kafka'))) {
            ops.push({ topic: kafkaSubscribe[1]!, broker: 'kafka', kind: 'consumer', line: i + 1 });
        }

        // RabbitMQ: channel.basic_publish(exchange='', routing_key='queue')
        const rabbitPub = line.match(/basic_publish\s*\(.*?routing_key\s*=\s*['"]([^'"]+)['"]/);
        if (rabbitPub) {
            ops.push({ topic: rabbitPub[1]!, broker: 'rabbitmq', kind: 'producer', line: i + 1 });
        }

        // RabbitMQ: channel.basic_consume(queue='name', ...)
        const rabbitConsume = line.match(/basic_consume\s*\(.*?queue\s*=\s*['"]([^'"]+)['"]/);
        if (rabbitConsume) {
            ops.push({ topic: rabbitConsume[1]!, broker: 'rabbitmq', kind: 'consumer', line: i + 1 });
        }

        // NATS: nc.publish('subject', ...), nc.subscribe('subject')
        const natsPub = line.match(/\.publish\s*\(\s*['"]([^'"]+)['"]/);
        if (natsPub && content.includes('nats')) {
            ops.push({ topic: natsPub[1]!, broker: 'nats', kind: 'producer', line: i + 1 });
        }

        const natsSub = line.match(/\.subscribe\s*\(\s*['"]([^'"]+)['"]/);
        if (natsSub && content.includes('nats') && !content.includes('kafka')) {
            ops.push({ topic: natsSub[1]!, broker: 'nats', kind: 'consumer', line: i + 1 });
        }
    }

    return ops;
}

export function buildPythonRuntimeNodes(
    redisOps: PythonRedisOp[],
    celeryTasks: PythonCeleryTask[],
    metrics: PythonMetricDef[],
    spans: PythonSpanDef[],
    brokerOps: PythonBrokerOp[],
    fileId: string,
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Redis → DBTable nodes with schema: 'redis'
    const seenRedisKeys = new Set<string>();
    for (const op of redisOps) {
        const key = op.key ?? `redis:${op.method}`;
        if (seenRedisKeys.has(key)) continue;
        seenRedisKeys.add(key);

        const nodeId = createNodeId('db_table', 'redis', key);
        nodes.push({
            id: nodeId,
            type: 'db_table' as const,
            name: key,
            schema: 'redis',
            operations: op.kind === 'read' ? ['SELECT'] : ['INSERT'],
        });

        if (op.kind === 'read') {
            edges.push({
                id: `${fileId}->reads_from->${nodeId}`,
                type: 'READS_FROM' as const,
                sourceId: fileId,
                targetId: nodeId,
                confidence: 0.9,
                query: op.method,
            });
        } else {
            edges.push({
                id: `${fileId}->writes_to->${nodeId}`,
                type: 'WRITES_TO' as const,
                sourceId: fileId,
                targetId: nodeId,
                confidence: 0.9,
                operation: 'INSERT' as const,
            });
        }
    }

    // Celery tasks → QueueJob nodes
    for (const task of celeryTasks) {
        const nodeId = createNodeId('queue_job', filePath, `celery:${task.name}`);
        nodes.push({
            id: nodeId,
            type: 'queue_job' as const,
            name: task.name,
            queueName: 'celery',
            filePath,
            jobKind: task.kind === 'define' ? 'consumer' : 'producer',
        });

        const edgeType = task.kind === 'define' ? 'CONSUMES_JOB' as const : 'PRODUCES_JOB' as const;
        edges.push({
            id: `${fileId}->${edgeType.toLowerCase()}->${nodeId}`,
            type: edgeType,
            sourceId: fileId,
            targetId: nodeId,
            confidence: 0.9,
        });
    }

    // Prometheus metrics → Metric nodes
    for (const metric of metrics) {
        const nodeId = createNodeId('metric', filePath, metric.name);
        nodes.push({
            id: nodeId,
            type: 'metric' as const,
            name: metric.name,
            metricType: metric.metricType,
            help: metric.help,
            filePath,
        });

        edges.push({
            id: `${fileId}->uses_metric->${nodeId}`,
            type: 'USES_METRIC' as const,
            sourceId: fileId,
            targetId: nodeId,
            confidence: 1.0,
            operation: 'define' as const,
        });
    }

    // OpenTelemetry spans → Span nodes
    for (const span of spans) {
        const nodeId = createNodeId('span', filePath, span.name);
        nodes.push({
            id: nodeId,
            type: 'span' as const,
            name: span.name,
            filePath,
        });

        edges.push({
            id: `${fileId}->starts_span->${nodeId}`,
            type: 'STARTS_SPAN' as const,
            sourceId: fileId,
            targetId: nodeId,
            confidence: 0.9,
        });
    }

    // Broker operations → Topic nodes
    for (const op of brokerOps) {
        const nodeId = createNodeId('topic', filePath, `${op.broker}:${op.topic}:${op.kind}`);
        nodes.push({
            id: nodeId,
            type: 'topic' as const,
            name: op.topic,
            broker: op.broker,
            topicKind: op.kind,
            filePath,
        });

        const edgeType = op.kind === 'producer' ? 'PRODUCES_MESSAGE' as const : 'CONSUMES_MESSAGE' as const;
        edges.push({
            id: `${fileId}->${edgeType.toLowerCase()}->${nodeId}`,
            type: edgeType,
            sourceId: fileId,
            targetId: nodeId,
            confidence: 0.9,
            topicName: op.topic,
        });
    }

    return { nodes, edges };
}
