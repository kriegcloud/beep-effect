import type { GraphNode, GraphEdge } from '@nomik/core';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// Secret / Credential Detection
//
// Detects hardcoded secrets in source code:
//   - AWS access keys (AKIA...)
//   - AWS secret keys (40-char base64)
//   - GitHub tokens (ghp_, gho_, ghs_, ghr_, github_pat_)
//   - JWT tokens (eyJ...)
//   - Generic API keys (api_key, apikey, secret_key patterns)
//   - Private keys (BEGIN RSA/EC/OPENSSH PRIVATE KEY)
//   - Basic auth in URLs (https://user:pass@host)
//   - Slack tokens (xoxb-, xoxp-, xoxo-, xoxa-)
//   - Stripe keys (sk_live_, rk_live_)
//   - SendGrid keys (SG.)
//   - Twilio keys (SK + 32 hex)
//
// Creates: SecurityIssueNode + HAS_SECURITY_ISSUE edges
// ────────────────────────────────────────────────────────────────────────

export interface SecretFinding {
    name: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'hardcoded_secret' | 'weak_crypto' | 'insecure_config' | 'exposed_credential';
    line: number;
    description: string;
    matchedPattern: string;
}

interface SecretPattern {
    name: string;
    regex: RegExp;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: SecretFinding['category'];
    description: string;
}

const SECRET_PATTERNS: SecretPattern[] = [
    // AWS
    {
        name: 'AWS Access Key',
        regex: /(?:^|[^a-zA-Z0-9])(AKIA[0-9A-Z]{16})(?:[^a-zA-Z0-9]|$)/,
        severity: 'critical',
        category: 'hardcoded_secret',
        description: 'AWS access key ID detected — rotate immediately',
    },
    {
        name: 'AWS Secret Key',
        regex: /(?:aws_secret_access_key|secret_key|secretAccessKey)\s*[:=]\s*['"]([A-Za-z0-9/+=]{40})['"]/i,
        severity: 'critical',
        category: 'hardcoded_secret',
        description: 'AWS secret access key detected — rotate immediately',
    },
    // GitHub
    {
        name: 'GitHub Token',
        regex: /(?:^|[^a-zA-Z0-9])(ghp_[A-Za-z0-9]{36,}|gho_[A-Za-z0-9]{36,}|ghs_[A-Za-z0-9]{36,}|ghr_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,})(?:[^a-zA-Z0-9]|$)/,
        severity: 'critical',
        category: 'hardcoded_secret',
        description: 'GitHub personal access token detected',
    },
    // JWT
    {
        name: 'JWT Token',
        regex: /['"]eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}['"]/,
        severity: 'high',
        category: 'hardcoded_secret',
        description: 'Hardcoded JWT token detected',
    },
    // Private keys
    {
        name: 'Private Key',
        regex: /-----BEGIN\s+(RSA|EC|OPENSSH|DSA|PGP)\s+PRIVATE\s+KEY-----/,
        severity: 'critical',
        category: 'hardcoded_secret',
        description: 'Private key embedded in source code',
    },
    // Slack
    {
        name: 'Slack Token',
        regex: /(?:^|[^a-zA-Z0-9])(xox[bpoa]-[0-9]{10,}-[0-9A-Za-z-]+)(?:[^a-zA-Z0-9]|$)/,
        severity: 'high',
        category: 'hardcoded_secret',
        description: 'Slack API token detected',
    },
    // Stripe
    {
        name: 'Stripe Secret Key',
        regex: /(?:^|[^a-zA-Z0-9])(sk_live_[0-9a-zA-Z]{24,}|rk_live_[0-9a-zA-Z]{24,})(?:[^a-zA-Z0-9]|$)/,
        severity: 'critical',
        category: 'hardcoded_secret',
        description: 'Stripe live secret key detected — rotate immediately',
    },
    // SendGrid
    {
        name: 'SendGrid API Key',
        regex: /(?:^|[^a-zA-Z0-9])(SG\.[A-Za-z0-9_-]{22,}\.[A-Za-z0-9_-]{22,})(?:[^a-zA-Z0-9]|$)/,
        severity: 'high',
        category: 'hardcoded_secret',
        description: 'SendGrid API key detected',
    },
    // Twilio
    {
        name: 'Twilio API Key',
        regex: /(?:^|[^a-zA-Z0-9])(SK[0-9a-fA-F]{32})(?:[^a-zA-Z0-9]|$)/,
        severity: 'high',
        category: 'hardcoded_secret',
        description: 'Twilio API key detected',
    },
    // Basic auth in URL
    {
        name: 'Basic Auth in URL',
        regex: /https?:\/\/[^/\s:]+:[^/\s@]+@[^/\s]+/,
        severity: 'high',
        category: 'exposed_credential',
        description: 'Credentials embedded in URL',
    },
    // Generic hardcoded keys assigned to variables
    {
        name: 'Generic API Key',
        regex: /(?:api_?key|api_?secret|secret_?key|auth_?token|access_?token|private_?key)\s*[:=]\s*['"][A-Za-z0-9+/=_-]{16,}['"]/i,
        severity: 'medium',
        category: 'hardcoded_secret',
        description: 'Possible hardcoded API key or secret in variable assignment',
    },
    // Password in variable assignment
    {
        name: 'Hardcoded Password',
        regex: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]/i,
        severity: 'medium',
        category: 'hardcoded_secret',
        description: 'Possible hardcoded password',
    },
];

// Lines to skip (common false positives)
const SKIP_LINE_PATTERNS = [
    /^\s*\/\//,           // single-line comment
    /^\s*\*/,             // block comment line
    /^\s*#/,              // Python/shell comment
    /\.example\b/i,       // example files
    /\.test\b/i,          // test files
    /\.spec\b/i,          // spec files
    /mock|fixture|stub/i, // test helpers
    /REPLACE_ME|YOUR_.*HERE|xxx|placeholder/i, // placeholder values
];

// ────────────────────────────────────────────────────────────────────────
// Extract secret findings from source content
// ────────────────────────────────────────────────────────────────────────

export function extractSecrets(content: string, filePath: string): SecretFinding[] {
    const findings: SecretFinding[] = [];
    const lines = content.split('\n');

    // Skip known non-source files
    if (filePath.endsWith('.md') || filePath.endsWith('.txt') || filePath.endsWith('.lock')) {
        return findings;
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        const lineNum = i + 1;

        // Skip comments and test/mock lines
        if (SKIP_LINE_PATTERNS.some(p => p.test(line))) continue;

        for (const pattern of SECRET_PATTERNS) {
            if (pattern.regex.test(line)) {
                findings.push({
                    name: pattern.name,
                    severity: pattern.severity,
                    category: pattern.category,
                    line: lineNum,
                    description: pattern.description,
                    matchedPattern: pattern.name,
                });
                break; // one finding per line max
            }
        }
    }

    return findings;
}

export function buildSecretNodes(
    findings: SecretFinding[],
    fileId: string,
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    for (const finding of findings) {
        const nodeId = createNodeId('security_issue', filePath, `${finding.name}:${finding.line}`);
        nodes.push({
            id: nodeId,
            type: 'security_issue' as const,
            name: finding.name,
            severity: finding.severity,
            category: finding.category,
            filePath,
            line: finding.line,
            description: finding.description,
        });

        edges.push({
            id: `${fileId}->has_security_issue->${nodeId}`,
            type: 'HAS_SECURITY_ISSUE' as const,
            sourceId: fileId,
            targetId: nodeId,
            confidence: 1.0,
        });
    }

    return { nodes, edges };
}
