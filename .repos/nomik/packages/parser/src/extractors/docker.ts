import type { GraphNode, GraphEdge } from '@nomik/core';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// Docker / Kubernetes Config Detection
//
// Detects:
//   - Dockerfile: FROM, EXPOSE, COPY, ENTRYPOINT, CMD
//   - docker-compose.yml: services, ports, depends_on, volumes
//   - Kubernetes manifests: Deployment, Service, ConfigMap, Ingress
//
// Creates: infrastructure metadata nodes linked to files
// ────────────────────────────────────────────────────────────────────────

export interface DockerServiceInfo {
    name: string;
    image?: string;
    ports: string[];
    dependsOn: string[];
    volumes: string[];
    environment: string[];
}

export interface DockerfileInfo {
    baseImage: string;
    exposedPorts: number[];
    entrypoint?: string;
    cmd?: string;
    stages: string[];
}

export interface K8sResourceInfo {
    kind: string;
    name: string;
    namespace?: string;
    labels: Record<string, string>;
    containerImages: string[];
    ports: number[];
}

export function extractDockerfileInfo(content: string): DockerfileInfo {
    const info: DockerfileInfo = { baseImage: '', exposedPorts: [], stages: [] };

    const lines = content.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || trimmed === '') continue;

        const fromMatch = trimmed.match(/^FROM\s+(\S+)(?:\s+[Aa][Ss]\s+(\S+))?/i);
        if (fromMatch) {
            if (!info.baseImage) info.baseImage = fromMatch[1] ?? '';
            if (fromMatch[2]) info.stages.push(fromMatch[2]);
        }

        const exposeMatch = trimmed.match(/^EXPOSE\s+(.+)/i);
        if (exposeMatch && exposeMatch[1]) {
            const ports = exposeMatch[1].split(/\s+/).map(p => parseInt(p, 10)).filter(n => !isNaN(n));
            info.exposedPorts.push(...ports);
        }

        const entryMatch = trimmed.match(/^ENTRYPOINT\s+(.+)/i);
        if (entryMatch) info.entrypoint = entryMatch[1]?.replace(/^\[|\]$/g, '').trim();

        const cmdMatch = trimmed.match(/^CMD\s+(.+)/i);
        if (cmdMatch) info.cmd = cmdMatch[1]?.replace(/^\[|\]$/g, '').trim();
    }

    return info;
}

export function extractDockerComposeServices(content: string): DockerServiceInfo[] {
    const services: DockerServiceInfo[] = [];

    // Find services block
    const servicesMatch = content.match(/^services:\s*$/m);
    if (!servicesMatch) return services;

    const startIdx = (servicesMatch.index ?? 0) + servicesMatch[0].length;
    const servicesBlock = content.slice(startIdx);

    // Match service names (2-space indented keys under services:)
    const servicePattern = /^  (\w[\w-]*):\s*$/gm;
    let match: RegExpExecArray | null;
    const serviceStarts: { name: string; idx: number }[] = [];

    while ((match = servicePattern.exec(servicesBlock)) !== null) {
        serviceStarts.push({ name: match[1] ?? '', idx: match.index });
    }

    for (let i = 0; i < serviceStarts.length; i++) {
        const start = serviceStarts[i]!;
        const end = serviceStarts[i + 1]?.idx ?? servicesBlock.length;
        const block = servicesBlock.slice(start.idx, end);

        const imageMatch = block.match(/image:\s*['"]?([^\s'"]+)['"]?/);
        const portsMatches = [...block.matchAll(/- ['"]?(\d+(?::\d+)?)['"]?/g)];
        const envMatches = [...block.matchAll(/- ['"]?(\w+)=['"]?([^'"\n]*)['"]?/g)];

        // Filter depends_on specifically
        const dependsOnSection = block.match(/depends_on:\s*\n((?:\s+- .+\n?)*)/);
        const dependsOn: string[] = [];
        if (dependsOnSection?.[1]) {
            const depMatches = [...dependsOnSection[1].matchAll(/- ['"]?(\w[\w-]*)['"]?/g)];
            for (const m of depMatches) if (m[1]) dependsOn.push(m[1]);
        }

        services.push({
            name: start.name,
            image: imageMatch?.[1],
            ports: portsMatches.map(m => m[1] ?? '').filter(Boolean),
            dependsOn,
            volumes: [],
            environment: envMatches.map(m => m[1] ?? '').filter(Boolean),
        });
    }

    return services;
}

export function extractK8sResources(content: string): K8sResourceInfo[] {
    const resources: K8sResourceInfo[] = [];

    // Split multi-document YAML by ---
    const docs = content.split(/^---\s*$/m);

    for (const doc of docs) {
        const kindMatch = doc.match(/kind:\s*(\w+)/);
        const nameMatch = doc.match(/name:\s*['"]?([^\s'"]+)['"]?/);
        if (!kindMatch?.[1] || !nameMatch?.[1]) continue;

        const kind = kindMatch[1];
        const name = nameMatch[1];
        const nsMatch = doc.match(/namespace:\s*['"]?([^\s'"]+)['"]?/);

        // Extract container images
        const imageMatches = [...doc.matchAll(/image:\s*['"]?([^\s'"]+)['"]?/g)];
        const containerImages = imageMatches.map(m => m[1] ?? '').filter(Boolean);

        // Extract ports
        const portMatches = [...doc.matchAll(/(?:containerPort|port|targetPort):\s*(\d+)/g)];
        const ports = portMatches.map(m => parseInt(m[1] ?? '0', 10)).filter(n => n > 0);

        // Extract labels
        const labels: Record<string, string> = {};
        const labelSection = doc.match(/labels:\s*\n((?:\s+\w[\w.-]*:\s*.+\n?)*)/);
        if (labelSection?.[1]) {
            const labelMatches = [...labelSection[1].matchAll(/(\w[\w.-]*):\s*['"]?([^\s'"]+)['"]?/g)];
            for (const m of labelMatches) {
                if (m[1] && m[2]) labels[m[1]] = m[2];
            }
        }

        resources.push({ kind, name, namespace: nsMatch?.[1], labels, containerImages, ports });
    }

    return resources;
}

export function buildDockerNodes(
    dockerfile: DockerfileInfo | null,
    composeServices: DockerServiceInfo[],
    k8sResources: K8sResourceInfo[],
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodes = new Set<string>();

    // Dockerfile → Route-like nodes for exposed ports
    if (dockerfile) {
        for (const port of dockerfile.exposedPorts) {
            const nodeId = createNodeId('route', filePath, `EXPOSE:${port}`);
            if (!seenNodes.has(nodeId)) {
                seenNodes.add(nodeId);
                nodes.push({
                    id: nodeId,
                    type: 'route',
                    method: 'EXPOSE' as any,
                    path: `:${port}`,
                    handlerName: dockerfile.baseImage,
                    filePath,
                    middleware: [],
                    apiTags: ['docker'],
                });
            }
        }
    }

    // docker-compose services → Route-like nodes for service ports
    for (const svc of composeServices) {
        for (const port of svc.ports) {
            const nodeId = createNodeId('route', filePath, `compose:${svc.name}:${port}`);
            if (!seenNodes.has(nodeId)) {
                seenNodes.add(nodeId);
                nodes.push({
                    id: nodeId,
                    type: 'route',
                    method: 'EXPOSE' as any,
                    path: `/${svc.name}:${port}`,
                    handlerName: svc.image ?? svc.name,
                    filePath,
                    middleware: [],
                    apiTags: ['docker-compose', svc.name],
                });
            }
        }
    }

    // K8s resources → Route-like nodes for services/ingresses
    for (const res of k8sResources) {
        if (res.kind === 'Service' || res.kind === 'Ingress' || res.kind === 'Deployment') {
            const nodeId = createNodeId('route', filePath, `k8s:${res.kind}:${res.name}`);
            if (!seenNodes.has(nodeId)) {
                seenNodes.add(nodeId);
                nodes.push({
                    id: nodeId,
                    type: 'route',
                    method: res.kind.toUpperCase() as any,
                    path: `/${res.namespace ?? 'default'}/${res.name}`,
                    handlerName: res.containerImages[0] ?? res.name,
                    filePath,
                    middleware: [],
                    apiTags: ['kubernetes', res.kind.toLowerCase()],
                });
            }
        }
    }

    return { nodes, edges };
}
