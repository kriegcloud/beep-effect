import type { DBSchemaColumn, DBSchemaTable } from './types.js';

/**
 * Detect whether a Python file contains Django or Alembic migration patterns.
 */
export function isPythonMigrationFile(content: string): boolean {
    return (
        /from\s+django\.db\s+import\s+migrations/i.test(content) ||
        /class\s+Migration\s*\(/i.test(content) ||
        /from\s+alembic\s+import\s+op\b/i.test(content) ||
        /import\s+alembic/i.test(content) ||
        /op\.create_table\s*\(/i.test(content)
    );
}

/**
 * Extract DB schema from Django migration files.
 *
 * Supported patterns:
 *   migrations.CreateModel(name='users', fields=[ ('id', models.AutoField(...)), ... ])
 *   migrations.AddField(model_name='users', name='phone', field=models.CharField(...))
 */
export function extractDBSchemaFromDjangoMigration(content: string): DBSchemaTable[] {
    const tables = new Map<string, DBSchemaTable>();

    // Pattern 1: migrations.CreateModel(name='TableName', fields=[ ... ])
    const createModelRegex = /(?:migrations\.)?CreateModel\s*\(\s*[\s\S]*?name\s*=\s*['"]([^'"]+)['"][\s\S]*?fields\s*=\s*\[([\s\S]*?)\]\s*,?\s*\)/gi;
    let match: RegExpExecArray | null;
    while ((match = createModelRegex.exec(content)) !== null) {
        const tableName = normalizeModelName(match[1] ?? '');
        const fieldsBlock = match[2] ?? '';
        if (!tableName) continue;

        const table = tables.get(tableName) ?? { name: tableName, columns: [] };
        for (const col of extractDjangoFields(fieldsBlock)) {
            if (!table.columns.some((c) => c.name === col.name)) {
                table.columns.push(col);
            }
        }
        tables.set(table.name, table);
    }

    // Pattern 2: migrations.AddField(model_name='users', name='phone', field=models.CharField(...))
    const addFieldRegex = /(?:migrations\.)?AddField\s*\(\s*[\s\S]*?model_name\s*=\s*['"]([^'"]+)['"][\s\S]*?name\s*=\s*['"]([^'"]+)['"][\s\S]*?field\s*=\s*(?:models\.)?(\w+)\s*\(/gi;
    while ((match = addFieldRegex.exec(content)) !== null) {
        const tableName = normalizeModelName(match[1] ?? '');
        const colName = match[2] ?? '';
        const fieldType = match[3] ?? '';
        if (!tableName || !colName) continue;

        const table = tables.get(tableName) ?? { name: tableName, columns: [] };
        if (!table.columns.some((c) => c.name === colName)) {
            table.columns.push({
                name: colName,
                dataType: djangoFieldToType(fieldType),
                nullable: undefined,
            });
        }
        tables.set(table.name, table);
    }

    return [...tables.values()];
}

/**
 * Extract DB schema from Alembic (SQLAlchemy) migration files.
 *
 * Supported patterns:
 *   op.create_table('users', sa.Column('id', sa.Integer(), ...), ...)
 *   op.add_column('users', sa.Column('phone', sa.String(length=20), ...))
 */
export function extractDBSchemaFromAlembicMigration(content: string): DBSchemaTable[] {
    const tables = new Map<string, DBSchemaTable>();

    // Pattern 1: op.create_table('tablename', sa.Column(...), ...)
    // Uses paren-depth matching because Column(...) contains nested parens
    const createTableStart = /op\.create_table\s*\(\s*['"]([^'"]+)['"]\s*,/gi;
    let match: RegExpExecArray | null;
    while ((match = createTableStart.exec(content)) !== null) {
        const tableName = match[1] ?? '';
        if (!tableName) continue;

        const blockStart = match.index + match[0].length;
        const columnsBlock = extractBalancedBlock(content, blockStart);
        const table = tables.get(tableName) ?? { name: tableName, columns: [] };
        for (const col of extractAlembicColumns(columnsBlock)) {
            if (!table.columns.some((c) => c.name === col.name)) {
                table.columns.push(col);
            }
        }
        tables.set(table.name, table);
    }

    // Pattern 2: op.add_column('tablename', sa.Column('colname', sa.Type(), ...))
    const addColumnRegex = /op\.add_column\s*\(\s*['"]([^'"]+)['"][\s\S]*?(?:sa\.)?Column\s*\(\s*['"]([^'"]+)['"](?:\s*,\s*(?:sa\.)?(\w+)\s*\()?/gi;
    while ((match = addColumnRegex.exec(content)) !== null) {
        const tableName = match[1] ?? '';
        const colName = match[2] ?? '';
        const saType = match[3] ?? '';
        if (!tableName || !colName) continue;

        const table = tables.get(tableName) ?? { name: tableName, columns: [] };
        if (!table.columns.some((c) => c.name === colName)) {
            table.columns.push({
                name: colName,
                dataType: saType || undefined,
                nullable: undefined,
            });
        }
        tables.set(table.name, table);
    }

    return [...tables.values()];
}

/**
 * Extract DB schema from any Python migration file (auto-detects Django vs Alembic).
 */
export function extractDBSchemaFromPythonMigration(content: string): DBSchemaTable[] {
    const djangoTables = extractDBSchemaFromDjangoMigration(content);
    const alembicTables = extractDBSchemaFromAlembicMigration(content);

    // Merge results (a file is typically one or the other, but merge safely)
    const merged = new Map<string, DBSchemaTable>();
    for (const t of [...djangoTables, ...alembicTables]) {
        const existing = merged.get(t.name);
        if (existing) {
            for (const col of t.columns) {
                if (!existing.columns.some((c) => c.name === col.name)) {
                    existing.columns.push(col);
                }
            }
        } else {
            merged.set(t.name, { ...t });
        }
    }

    return [...merged.values()];
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Extract text from `startIdx` up to the matching closing paren,
 * tracking nested parentheses depth. Returns content before the
 * closing `)` that balances the already-opened `(`.
 */
function extractBalancedBlock(content: string, startIdx: number): string {
    let depth = 1; // we are already inside the opening paren
    let i = startIdx;
    while (i < content.length && depth > 0) {
        if (content[i] === '(') depth++;
        else if (content[i] === ')') depth--;
        if (depth > 0) i++;
    }
    return content.slice(startIdx, i);
}

function extractDjangoFields(fieldsBlock: string): DBSchemaColumn[] {
    const cols: DBSchemaColumn[] = [];
    // Match ('field_name', models.FieldType(...))
    const fieldRegex = /\(\s*['"]([^'"]+)['"][\s\S]*?(?:models\.)?(\w+)\s*\(/g;
    let match: RegExpExecArray | null;
    while ((match = fieldRegex.exec(fieldsBlock)) !== null) {
        const name = match[1] ?? '';
        const fieldType = match[2] ?? '';
        if (!name) continue;
        cols.push({
            name,
            dataType: djangoFieldToType(fieldType),
            nullable: undefined,
        });
    }
    return cols;
}

function extractAlembicColumns(columnsBlock: string): DBSchemaColumn[] {
    const cols: DBSchemaColumn[] = [];
    // Match sa.Column('colname', sa.Type(), nullable=True/False)
    const colRegex = /(?:sa\.)?Column\s*\(\s*['"]([^'"]+)['"](?:\s*,\s*(?:sa\.)?(\w+)\s*\()?[^)]*\)(?:\s*,\s*(?:[\s\S]*?nullable\s*=\s*(True|False))?)?/gi;
    let match: RegExpExecArray | null;
    while ((match = colRegex.exec(columnsBlock)) !== null) {
        const name = match[1] ?? '';
        const saType = match[2] ?? '';
        const nullableStr = match[3];
        if (!name) continue;
        // Skip PrimaryKeyConstraint, UniqueConstraint etc.
        if (/Constraint/i.test(name)) continue;
        cols.push({
            name,
            dataType: saType || undefined,
            nullable: nullableStr ? nullableStr === 'True' : undefined,
        });
    }
    return cols;
}

function normalizeModelName(name: string): string {
    // Django model names are PascalCase in code but often lowercase in DB.
    // Keep as-is since the graph tracks the logical name.
    return name.trim();
}

function djangoFieldToType(fieldType: string): string | undefined {
    const map: Record<string, string> = {
        AutoField: 'integer',
        BigAutoField: 'bigint',
        SmallAutoField: 'smallint',
        IntegerField: 'integer',
        BigIntegerField: 'bigint',
        SmallIntegerField: 'smallint',
        PositiveIntegerField: 'integer',
        PositiveBigIntegerField: 'bigint',
        PositiveSmallIntegerField: 'smallint',
        FloatField: 'float',
        DecimalField: 'decimal',
        CharField: 'varchar',
        TextField: 'text',
        BooleanField: 'boolean',
        NullBooleanField: 'boolean',
        DateField: 'date',
        DateTimeField: 'datetime',
        TimeField: 'time',
        DurationField: 'interval',
        UUIDField: 'uuid',
        BinaryField: 'binary',
        FileField: 'varchar',
        ImageField: 'varchar',
        EmailField: 'varchar',
        URLField: 'varchar',
        SlugField: 'varchar',
        IPAddressField: 'varchar',
        GenericIPAddressField: 'varchar',
        JSONField: 'json',
        ForeignKey: 'integer',
        OneToOneField: 'integer',
        ManyToManyField: 'junction',
    };
    return map[fieldType] ?? (fieldType || undefined);
}
