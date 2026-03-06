export interface DBSchemaColumn {
    name: string;
    dataType?: string;
    nullable?: boolean;
}

export interface DBSchemaTable {
    name: string;
    schema?: string;
    columns: DBSchemaColumn[];
}
