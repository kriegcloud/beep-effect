import { entityKind } from "../entity";
import { TableName } from "../table.utils";
import type { PgColumn } from "./columns/index";
import type { PgTable } from "./table";

export function unique(name?: undefined | string): UniqueOnConstraintBuilder {
  return new UniqueOnConstraintBuilder(name);
}

export function uniqueKeyName(table: PgTable, columns: string[]) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}

export class UniqueConstraintBuilder {
  static readonly [entityKind]: string = "PgUniqueConstraintBuilder";

  /** @internal */
  columns: PgColumn[];
  /** @internal */
  nullsNotDistinctConfig = false;

  constructor(
    columns: PgColumn[],
    private name?: undefined | string
  ) {
    this.columns = columns;
  }

  nullsNotDistinct() {
    this.nullsNotDistinctConfig = true;
    return this;
  }

  /** @internal */
  build(table: PgTable): UniqueConstraint {
    return new UniqueConstraint(table, this.columns, this.nullsNotDistinctConfig, this.name);
  }
}

export class UniqueOnConstraintBuilder {
  static readonly [entityKind]: string = "PgUniqueOnConstraintBuilder";

  /** @internal */
  name?: undefined | string;

  constructor(name?: undefined | string) {
    this.name = name;
  }

  on(...columns: [PgColumn, ...PgColumn[]]) {
    return new UniqueConstraintBuilder(columns, this.name);
  }
}

export class UniqueConstraint {
  static readonly [entityKind]: string = "PgUniqueConstraint";

  readonly columns: PgColumn[];
  readonly name?: undefined | string;
  readonly isNameExplicit: boolean;
  readonly nullsNotDistinct: boolean = false;

  constructor(
    readonly table: PgTable,
    columns: PgColumn[],
    nullsNotDistinct: boolean,
    name?: undefined | string
  ) {
    this.columns = columns;
    this.name =
      name ??
      uniqueKeyName(
        this.table,
        this.columns.map((column) => column.name)
      );
    this.isNameExplicit = !!name;
    this.nullsNotDistinct = nullsNotDistinct;
  }

  getName() {
    return this.name;
  }
}
