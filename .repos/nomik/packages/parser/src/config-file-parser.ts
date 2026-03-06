// ────────────────────────────────────────────────────────────────────────
// Config File Parser — dispatches non-code files to their extractors
//
// Handles: .env, Dockerfile, docker-compose, k8s, Terraform, GraphQL,
//          OpenAPI, CloudFormation, CI/CD, Prometheus/Grafana, package.json,
//          requirements.txt, test files
// ────────────────────────────────────────────────────────────────────────

import path from 'node:path';
import type { FileNode, GraphNode, GraphEdge } from '@nomik/core';
import { createNodeId, createFileHash } from './utils';
import type { ParseResult } from './types';
import type { SupportedLanguage } from './languages/registry';

// Config extractors
import { extractEnvDefinitions, buildEnvDefinitionNodes } from './extractors/dotenv';
import { extractDockerfileInfo, extractDockerComposeServices, extractK8sResources, buildDockerNodes } from './extractors/docker';
import { extractTerraformResources, extractTerraformVariables, extractTerraformModules, extractTerraformOutputs, buildTerraformNodes } from './extractors/terraform';
import { extractGraphQLSchema, buildGraphQLNodes } from './extractors/graphql-schema';
import { extractOpenAPIRoutesFromJSON, extractOpenAPIRoutesFromYAML, buildOpenAPIRouteNodes } from './extractors/openapi-spec';
import { extractCFNResources, extractCFNParameters, extractCFNOutputs, buildCFNNodes } from './extractors/cloudformation';
import { extractGitHubActionsJobs, extractGitLabCIJobs, buildCICDNodes } from './extractors/cicd';
import { extractAlertRules, extractGrafanaPanels, buildInfraConfigNodes } from './extractors/infra-config';
import { extractDependencies, buildDependencyNodes } from './extractors/dependencies';

// ────────────────────────────────────────────────────────────────────────
// Main entry point
// ────────────────────────────────────────────────────────────────────────

export function parseConfigFile(
    absolutePath: string,
    content: string,
    language: SupportedLanguage,
): ParseResult {
    const fileNode = buildFileNode(absolutePath, content, language);
    const nodes: GraphNode[] = [fileNode];
    const edges: GraphEdge[] = [];

    const basename = path.basename(absolutePath).toLowerCase();

    switch (language) {
        case 'dotenv':
            parseDotenv(content, absolutePath, fileNode, nodes, edges);
            break;

        case 'dockerfile':
            parseDockerfile(content, absolutePath, basename, fileNode, nodes, edges);
            break;

        case 'terraform':
            parseTerraform(content, absolutePath, fileNode, nodes, edges);
            break;

        case 'graphql':
            parseGraphQL(content, absolutePath, fileNode, nodes, edges);
            break;

        case 'yaml':
            parseYAML(content, absolutePath, basename, fileNode, nodes, edges);
            break;

        case 'json-config':
            parseJSONConfig(content, absolutePath, basename, fileNode, nodes, edges);
            break;

        default:
            break;
    }

    return {
        file: fileNode,
        nodes,
        edges,
        imports: [],
        exports: [],
        calls: [],
        arrayAliases: {},
    };
}

// ────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────

function buildFileNode(absolutePath: string, content: string, language: string): FileNode {
    return {
        id: createNodeId('file', absolutePath, ''),
        type: 'file',
        path: absolutePath,
        language,
        hash: createFileHash(content),
        size: Buffer.byteLength(content, 'utf-8'),
        lineCount: content.split('\n').length,
        lastParsed: new Date().toISOString(),
    };
}

function addContainsEdges(fileNode: FileNode, newNodes: GraphNode[], edges: GraphEdge[]): void {
    for (const n of newNodes) {
        edges.push({
            id: `${fileNode.id}->contains->${n.id}`,
            type: 'CONTAINS' as const,
            sourceId: fileNode.id,
            targetId: n.id,
            confidence: 1.0,
        });
    }
}

// ────────────────────────────────────────────────────────────────────────
// .env files
// ────────────────────────────────────────────────────────────────────────

function parseDotenv(content: string, filePath: string, fileNode: FileNode, nodes: GraphNode[], edges: GraphEdge[]): void {
    const defs = extractEnvDefinitions(content, filePath);
    if (defs.length === 0) return;
    const result = buildEnvDefinitionNodes(defs, fileNode.id, filePath);
    nodes.push(...result.nodes);
    edges.push(...result.edges);
}

// ────────────────────────────────────────────────────────────────────────
// Dockerfile / docker-compose / k8s
// ────────────────────────────────────────────────────────────────────────

function parseDockerfile(content: string, filePath: string, basename: string, fileNode: FileNode, nodes: GraphNode[], edges: GraphEdge[]): void {
    const dockerfile = basename.startsWith('dockerfile') ? extractDockerfileInfo(content) : null;
    const result = buildDockerNodes(dockerfile, [], [], filePath);
    nodes.push(...result.nodes);
    edges.push(...result.edges);
    addContainsEdges(fileNode, result.nodes, edges);
}

// ────────────────────────────────────────────────────────────────────────
// Terraform
// ────────────────────────────────────────────────────────────────────────

function parseTerraform(content: string, filePath: string, fileNode: FileNode, nodes: GraphNode[], edges: GraphEdge[]): void {
    const resources = extractTerraformResources(content, filePath);
    const variables = extractTerraformVariables(content, filePath);
    const modules = extractTerraformModules(content, filePath);
    const outputs = extractTerraformOutputs(content, filePath);
    const result = buildTerraformNodes(resources, variables, modules, outputs, filePath);
    nodes.push(...result.nodes);
    edges.push(...result.edges);
    addContainsEdges(fileNode, result.nodes, edges);
}

// ────────────────────────────────────────────────────────────────────────
// GraphQL schema
// ────────────────────────────────────────────────────────────────────────

function parseGraphQL(content: string, filePath: string, fileNode: FileNode, nodes: GraphNode[], edges: GraphEdge[]): void {
    const schema = extractGraphQLSchema(content, filePath);
    if (schema.types.length === 0 && schema.operations.length === 0) return;
    const result = buildGraphQLNodes(schema.types, schema.operations, filePath);
    nodes.push(...result.nodes);
    edges.push(...result.edges);
    addContainsEdges(fileNode, result.nodes, edges);
}

// ────────────────────────────────────────────────────────────────────────
// YAML files — dispatch by filename
// ────────────────────────────────────────────────────────────────────────

function parseYAML(content: string, filePath: string, basename: string, fileNode: FileNode, nodes: GraphNode[], edges: GraphEdge[]): void {
    // Docker Compose
    if (basename.startsWith('docker-compose')) {
        const services = extractDockerComposeServices(content);
        const k8s = extractK8sResources(content);
        const result = buildDockerNodes(null, services, k8s, filePath);
        nodes.push(...result.nodes);
        edges.push(...result.edges);
        addContainsEdges(fileNode, result.nodes, edges);
        return;
    }

    // GitHub Actions
    if (filePath.includes('.github/workflows') || filePath.includes('.github\\workflows')) {
        const jobs = extractGitHubActionsJobs(content, filePath);
        if (jobs.length > 0) {
            const result = buildCICDNodes(jobs, filePath);
            nodes.push(...result.nodes);
            edges.push(...result.edges);
            addContainsEdges(fileNode, result.nodes, edges);
        }
        return;
    }

    // GitLab CI
    if (basename === '.gitlab-ci.yml' || basename === '.gitlab-ci.yaml') {
        const jobs = extractGitLabCIJobs(content, filePath);
        if (jobs.length > 0) {
            const result = buildCICDNodes(jobs, filePath);
            nodes.push(...result.nodes);
            edges.push(...result.edges);
            addContainsEdges(fileNode, result.nodes, edges);
        }
        return;
    }

    // CloudFormation templates
    if (content.includes('AWSTemplateFormatVersion') || content.includes('aws:cloudformation')) {
        const resources = extractCFNResources(content, filePath);
        const params = extractCFNParameters(content, filePath);
        const outputs = extractCFNOutputs(content, filePath);
        const result = buildCFNNodes(resources, params, outputs, filePath);
        nodes.push(...result.nodes);
        edges.push(...result.edges);
        addContainsEdges(fileNode, result.nodes, edges);
        return;
    }

    // Prometheus / Alertmanager
    if (basename.includes('prometheus') || basename.includes('alertmanager') || basename.includes('alerts')) {
        const alerts = extractAlertRules(content, filePath);
        if (alerts.length > 0) {
            const result = buildInfraConfigNodes(alerts, [], filePath);
            nodes.push(...result.nodes);
            edges.push(...result.edges);
            addContainsEdges(fileNode, result.nodes, edges);
        }
        return;
    }

    // OpenAPI / Swagger YAML
    if (basename.includes('openapi') || basename.includes('swagger') || content.includes('openapi:') || content.includes('swagger:')) {
        const routes = extractOpenAPIRoutesFromYAML(content, filePath);
        if (routes.length > 0) {
            const result = buildOpenAPIRouteNodes(routes, filePath);
            nodes.push(...result.nodes);
            edges.push(...result.edges);
            addContainsEdges(fileNode, result.nodes, edges);
        }
        return;
    }

    // K8s manifests (has apiVersion + kind)
    if (content.includes('apiVersion:') && content.includes('kind:')) {
        const k8s = extractK8sResources(content);
        if (k8s.length > 0) {
            const result = buildDockerNodes(null, [], k8s, filePath);
            nodes.push(...result.nodes);
            edges.push(...result.edges);
            addContainsEdges(fileNode, result.nodes, edges);
        }
    }
}

// ────────────────────────────────────────────────────────────────────────
// JSON config files — dispatch by filename
// ────────────────────────────────────────────────────────────────────────

function parseJSONConfig(content: string, filePath: string, basename: string, fileNode: FileNode, nodes: GraphNode[], edges: GraphEdge[]): void {
    // package.json
    if (basename === 'package.json') {
        const deps = extractDependencies(content, filePath);
        if (deps.length > 0) {
            const result = buildDependencyNodes(deps, fileNode.id, filePath);
            nodes.push(...result.nodes);
            edges.push(...result.edges);
            addContainsEdges(fileNode, result.nodes, edges);
        }
        return;
    }

    // OpenAPI / Swagger JSON
    if (basename.includes('openapi') || basename.includes('swagger')) {
        const routes = extractOpenAPIRoutesFromJSON(content, filePath);
        if (routes.length > 0) {
            const result = buildOpenAPIRouteNodes(routes, filePath);
            nodes.push(...result.nodes);
            edges.push(...result.edges);
            addContainsEdges(fileNode, result.nodes, edges);
        }
        return;
    }

    // Grafana dashboards
    if (basename.includes('grafana') || content.includes('"panels"')) {
        try {
            const panels = extractGrafanaPanels(content, filePath);
            if (panels.length > 0) {
                const result = buildInfraConfigNodes([], panels, filePath);
                nodes.push(...result.nodes);
                edges.push(...result.edges);
                addContainsEdges(fileNode, result.nodes, edges);
            }
        } catch { /* not a grafana file */ }
    }
}
