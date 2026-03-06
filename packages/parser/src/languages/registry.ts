import path from 'node:path';

export type SupportedLanguage =
    | 'typescript' | 'tsx' | 'javascript' | 'markdown' | 'python' | 'rust' | 'sql' | 'csharp'
    | 'yaml' | 'json-config' | 'dotenv' | 'dockerfile' | 'terraform' | 'graphql';

const extensionMap: Record<string, SupportedLanguage> = {
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.mjs': 'javascript',
    '.cjs': 'javascript',
    '.md': 'markdown',
    '.py': 'python',
    '.pyw': 'python',
    '.rs': 'rust',
    '.sql': 'sql',
    '.cs': 'csharp',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.tf': 'terraform',
    '.tfvars': 'terraform',
    '.graphql': 'graphql',
    '.gql': 'graphql',
};

// Files matched by full name (case-insensitive basename)
const nameMap: Record<string, SupportedLanguage> = {
    'dockerfile': 'dockerfile',
    'docker-compose.yml': 'yaml',
    'docker-compose.yaml': 'yaml',
    '.env': 'dotenv',
    '.env.example': 'dotenv',
    '.env.local': 'dotenv',
    '.env.production': 'dotenv',
    '.env.development': 'dotenv',
};

export function detectLanguage(filePath: string): SupportedLanguage | null {
    const basename = path.basename(filePath).toLowerCase();

    // Check exact filename matches first (Dockerfile, .env, etc.)
    if (nameMap[basename]) return nameMap[basename]!;
    // Check .env.* pattern
    if (basename.startsWith('.env')) return 'dotenv';
    // Dockerfile.* variants
    if (basename.startsWith('dockerfile')) return 'dockerfile';

    const ext = path.extname(filePath).toLowerCase();
    return extensionMap[ext] ?? null;
}

// Config file types that don't use tree-sitter
export const CONFIG_LANGUAGES = new Set<SupportedLanguage>([
    'yaml', 'json-config', 'dotenv', 'dockerfile', 'terraform', 'graphql',
]);

export function isConfigFile(language: SupportedLanguage): boolean {
    return CONFIG_LANGUAGES.has(language);
}

export function isSupportedFile(filePath: string): boolean {
    return detectLanguage(filePath) !== null;
}

