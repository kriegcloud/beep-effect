import type { DBSchemaTable } from './types.js';

export function extractDBSchemaFromCSharpMigration(content: string): DBSchemaTable[] {
    const tables = new Map<string, DBSchemaTable>();

    const createTableRegex = /migrationBuilder\.CreateTable\s*\(([\s\S]*?)\);/gi;
    let match: RegExpExecArray | null;
    while ((match = createTableRegex.exec(content)) !== null) {
        const block = match[1] ?? '';
        const tableMatch = /name\s*:\s*"([^"]+)"/i.exec(block);
        const tableName = tableMatch?.[1]?.trim();
        if (!tableName) continue;

        const table = tables.get(tableName) ?? { name: tableName, columns: [] };
        const columnsBlockMatch = /columns\s*:\s*table\s*=>\s*new\s*\{([\s\S]*?)\}\s*,/i.exec(block);
        const columnsBlock = columnsBlockMatch?.[1] ?? '';
        const columnRegex = /([A-Za-z_][A-Za-z0-9_]*)\s*=\s*table\.Column<([^>]+)>\(([^)]*)\)/g;
        let colMatch: RegExpExecArray | null;
        while ((colMatch = columnRegex.exec(columnsBlock)) !== null) {
            const colName = colMatch[1] ?? '';
            if (!colName) continue;
            const dataType = (colMatch[2] ?? '').trim() || undefined;
            const args = colMatch[3] ?? '';
            const nullableMatch = /nullable\s*:\s*(true|false)/i.exec(args);
            const nullable = nullableMatch ? nullableMatch[1]?.toLowerCase() === 'true' : undefined;
            if (!table.columns.some((c) => c.name === colName)) {
                table.columns.push({ name: colName, dataType, nullable });
            }
        }

        tables.set(table.name, table);
    }

    const addColumnRegex = /migrationBuilder\.AddColumn<([^>]+)>\s*\(\s*name\s*:\s*"([^"]+)"[\s\S]*?table\s*:\s*"([^"]+)"/gi;
    while ((match = addColumnRegex.exec(content)) !== null) {
        const dataType = (match[1] ?? '').trim() || undefined;
        const colName = (match[2] ?? '').trim();
        const tableName = (match[3] ?? '').trim();
        if (!tableName || !colName) continue;

        const table = tables.get(tableName) ?? { name: tableName, columns: [] };
        if (!table.columns.some((c) => c.name === colName)) {
            table.columns.push({ name: colName, dataType });
        }
        tables.set(table.name, table);
    }

    return [...tables.values()];
}
