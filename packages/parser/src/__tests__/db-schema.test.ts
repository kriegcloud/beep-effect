import { describe, it, expect } from 'vitest';
import { extractDBSchemaFromSQL, extractDBSchemaFromCSharpMigration, buildDBSchemaNodesAndEdges } from '../extractors/db-schema/index';
import { extractDBSchemaFromDjangoMigration, extractDBSchemaFromAlembicMigration, isPythonMigrationFile, extractDBSchemaFromPythonMigration } from '../extractors/db-schema/python';

describe('db-schema extractor (sql)', () => {
    it('extracts table + columns from CREATE TABLE and ALTER TABLE ADD COLUMN', () => {
        const sql = `
            CREATE TABLE users (
              id INT NOT NULL,
              email VARCHAR(255),
              created_at TIMESTAMP
            );

            ALTER TABLE users ADD COLUMN is_active BOOLEAN;
        `;

        const tables = extractDBSchemaFromSQL(sql);
        expect(tables.length).toBe(1);
        expect(tables[0]?.name).toBe('users');
        expect(tables[0]?.columns.some(c => c.name === 'id')).toBe(true);
        expect(tables[0]?.columns.some(c => c.name === 'email')).toBe(true);
        expect(tables[0]?.columns.some(c => c.name === 'is_active')).toBe(true);
    });
});

describe('db-schema extractor (csharp migration)', () => {
    it('extracts table + columns from migrationBuilder.CreateTable/AddColumn', () => {
        const cs = `
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        `;

        const tables = extractDBSchemaFromCSharpMigration(cs);
        expect(tables.length).toBe(1);
        expect(tables[0]?.name).toBe('Users');
        expect(tables[0]?.columns.some(c => c.name === 'Id')).toBe(true);
        expect(tables[0]?.columns.some(c => c.name === 'Email')).toBe(true);
        expect(tables[0]?.columns.some(c => c.name === 'Phone')).toBe(true);
    });
});

describe('db-schema extractor (django migration)', () => {
    it('extracts table + columns from CreateModel and AddField', () => {
        const py = `
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = []
    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('email', models.CharField(max_length=255)),
                ('name', models.CharField(max_length=100)),
            ],
        ),
        migrations.AddField(
            model_name='User',
            name='phone',
            field=models.CharField(max_length=20),
        ),
    ]
        `;

        const tables = extractDBSchemaFromDjangoMigration(py);
        expect(tables.length).toBe(1);
        expect(tables[0]?.name).toBe('User');
        expect(tables[0]?.columns.some(c => c.name === 'id')).toBe(true);
        expect(tables[0]?.columns.some(c => c.name === 'email')).toBe(true);
        expect(tables[0]?.columns.some(c => c.name === 'phone')).toBe(true);
        expect(tables[0]?.columns.length).toBe(4);
    });
});

describe('db-schema extractor (alembic migration)', () => {
    it('extracts table + columns from op.create_table and op.add_column', () => {
        const py = `
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.add_column('users', sa.Column('phone', sa.String(length=20), nullable=True))
        `;

        const tables = extractDBSchemaFromAlembicMigration(py);
        expect(tables.length).toBe(1);
        expect(tables[0]?.name).toBe('users');
        expect(tables[0]?.columns.some(c => c.name === 'id')).toBe(true);
        expect(tables[0]?.columns.some(c => c.name === 'email')).toBe(true);
        expect(tables[0]?.columns.some(c => c.name === 'phone')).toBe(true);
    });
});

describe('isPythonMigrationFile', () => {
    it('detects Django migration files', () => {
        expect(isPythonMigrationFile('from django.db import migrations')).toBe(true);
        expect(isPythonMigrationFile('class Migration(migrations.Migration):')).toBe(true);
    });

    it('detects Alembic migration files', () => {
        expect(isPythonMigrationFile('from alembic import op')).toBe(true);
        expect(isPythonMigrationFile('op.create_table("users"')).toBe(true);
    });

    it('returns false for regular Python files', () => {
        expect(isPythonMigrationFile('def hello():\n    print("hi")')).toBe(false);
    });
});

describe('extractDBSchemaFromPythonMigration (unified)', () => {
    it('extracts from both Django and Alembic in one call', () => {
        const djangoPy = `
from django.db import migrations, models
class Migration(migrations.Migration):
    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('total', models.DecimalField()),
            ],
        ),
    ]
        `;
        const tables = extractDBSchemaFromPythonMigration(djangoPy);
        expect(tables.length).toBe(1);
        expect(tables[0]?.name).toBe('Order');
        expect(tables[0]?.columns.some(c => c.name === 'total')).toBe(true);
    });
});

describe('buildDBSchemaNodesAndEdges', () => {
    it('builds DBTable/DBColumn nodes and CONTAINS edges', () => {
        const schema = [{
            name: 'users',
            columns: [{ name: 'id' }, { name: 'email' }],
        }];
        const { nodes, edges } = buildDBSchemaNodesAndEdges(schema, 'file-id', '/tmp/migration.sql');

        expect(nodes.some(n => n.type === 'db_table' && (n as any).name === 'users')).toBe(true);
        expect(nodes.some(n => n.type === 'db_column' && (n as any).name === 'id')).toBe(true);
        expect(edges.some(e => e.type === 'CONTAINS' && e.sourceId === 'file-id')).toBe(true);
        expect(edges.filter(e => e.type === 'CONTAINS').length).toBeGreaterThanOrEqual(3);
    });
});
