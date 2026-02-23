import { entityKind } from "../../../entity";
import type { PgTable } from "../../../pg-core/table";
import { getColumnNameAndConfig } from "../../../utils";
import { PgColumn, PgColumnBuilder } from "../common";

export class PgVectorBuilder extends PgColumnBuilder<
  {
    dataType: "array vector";
    data: number[];
    driverParam: string;
  },
  { length: number; isLengthExact: true }
> {
  static override readonly [entityKind]: string = "PgVectorBuilder";

  constructor(name: string, config: PgVectorConfig) {
    super(name, "array vector", "PgVector");
    this.config.length = config.dimensions;
    this.config.isLengthExact = true;
  }

  /** @internal */
  override build(table: PgTable<any>) {
    return new PgVector(table, this.config as any);
  }
}

export class PgVector extends PgColumn<"array vector"> {
  static override readonly [entityKind]: string = "PgVector";

  getSQLType(): string {
    return `vector(${this.length})`;
  }

  override mapToDriverValue(value: unknown): unknown {
    return JSON.stringify(value);
  }

  override mapFromDriverValue(value: string): unknown {
    return value
      .slice(1, -1)
      .split(",")
      .map((v) => Number.parseFloat(v));
  }
}

export interface PgVectorConfig {
  dimensions: number;
}

export function vector(config: PgVectorConfig): PgVectorBuilder;
export function vector(name: string, config: PgVectorConfig): PgVectorBuilder;
export function vector(a: string | PgVectorConfig, b?: PgVectorConfig) {
  const { name, config } = getColumnNameAndConfig<PgVectorConfig>(a, b);
  return new PgVectorBuilder(name, config);
}
