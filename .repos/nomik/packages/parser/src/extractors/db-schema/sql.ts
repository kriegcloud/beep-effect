import type { DBSchemaColumn, DBSchemaTable } from './types.js';

export function extractDBSchemaFromSQL(content: string): DBSchemaTable[] {
    const sql = stripSqlComments(content);
    const tables = new Map<string, DBSchemaTable>();

    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"\[\]\w.]+)\s*\(([\s\S]*?)\)\s*;/gi;
    let match: RegExpExecArray | null;
    while ((match = createTableRegex.exec(sql)) !== null) {
        const rawName = match[1] ?? '';
        const defs = match[2] ?? '';
        const table = parseTableName(rawName);
        if (!table.name) continue;

        const entry = tables.get(table.name) ?? { name: table.name, schema: table.schema, columns: [] };
        for (const col of extractSqlColumnsFromDefinition(defs)) {
            if (!entry.columns.some((c) => c.name === col.name)) entry.columns.push(col);
        }
        tables.set(entry.name, entry);
    }

    const alterAddRegex = /ALTER\s+TABLE\s+([`"\[\]\w.]+)\s+ADD\s+(?:COLUMN\s+)?([`"\[\]\w]+)\s+([A-Za-z][A-Za-z0-9_(),\s]*)/gi;
    while ((match = alterAddRegex.exec(sql)) !== null) {
        const table = parseTableName(match[1] ?? '');
        const colName = normalizeIdent(match[2] ?? '');
        if (!table.name || !colName) continue;

        const entry = tables.get(table.name) ?? { name: table.name, schema: table.schema, columns: [] };
        if (!entry.columns.some((c) => c.name === colName)) {
            entry.columns.push({ name: colName, dataType: (match[3] ?? '').trim() || undefined });
        }
        tables.set(entry.name, entry);
    }

    return [...tables.values()];
}

function stripSqlComments(sql: string): string {
    const noBlock = sql.replace(/\/\*[\s\S]*?\*\//g, ' ');
    return noBlock.replace(/--.*$/gm, ' ');
}

function parseTableName(raw: string): { schema?: string; name: string } {
    const cleaned = raw
        .split('.')
        .map((p) => normalizeIdent(p))
        .filter(Boolean);
    if (cleaned.length === 0) return { name: '' };
    if (cleaned.length === 1) return { name: cleaned[0]! };
    return { schema: cleaned.slice(0, -1).join('.'), name: cleaned[cleaned.length - 1]! };
}

function extractSqlColumnsFromDefinition(defs: string): DBSchemaColumn[] {
    const cols: DBSchemaColumn[] = [];
    const parts = splitCommaAware(defs);

    for (const part of parts) {
        const line = part.trim();
        if (!line) continue;
        if (/^(CONSTRAINT|PRIMARY|FOREIGN|UNIQUE|CHECK|INDEX|KEY)\b/i.test(line)) continue;

        const match = /^([`"\[]?[A-Za-z_][\w$]*[`"\]]?)\s+([A-Za-z][A-Za-z0-9_(),\s]*)/i.exec(line);
        if (!match) continue;

        const name = normalizeIdent(match[1] ?? '');
        if (!name) continue;
        const dataType = (match[2] ?? '').trim() || undefined;
        const nullable = !/\bNOT\s+NULL\b/i.test(line);
        cols.push({ name, dataType, nullable });
    }

    return cols;
}

function splitCommaAware(input: string): string[] {
    const parts: string[] = [];
    let current = '';
    let depth = 0;
    for (const ch of input) {
        if (ch === '(') depth++;
        if (ch === ')' && depth > 0) depth--;
        if (ch === ',' && depth === 0) {
            parts.push(current);
            current = '';
            continue;
        }
        current += ch;
    }
    if (current.trim()) parts.push(current);
    return parts;
}

function normalizeIdent(value: string): string {
    return value.trim().replace(/^[`"\[]/, '').replace(/[`"\]]$/, '').trim();
}
