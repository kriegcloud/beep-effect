import { entityKind } from "../../entity";
import type { PgTable } from "../../pg-core/table";
import { getColumnNameAndConfig } from "../../utils";
import { PgColumn, PgColumnBuilder } from "./common";
import type { Precision } from "./timestamp";

export class PgTimeBuilder extends PgColumnBuilder<
  {
    dataType: "string time";
    data: string;
    driverParam: string;
  },
  { withTimezone: boolean; precision: number | undefined }
> {
  static override readonly [entityKind]: string = "PgTimeBuilder";

  constructor(
    name: string,
    readonly withTimezone: boolean,
    readonly precision: number | undefined
  ) {
    super(name, "string time", "PgTime");
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }

  /** @internal */
  override build(table: PgTable<any>) {
    return new PgTime(table, this.config as any);
  }
}

export class PgTime extends PgColumn<"string time"> {
  static override readonly [entityKind]: string = "PgTime";

  readonly withTimezone: boolean;
  readonly precision: number | undefined;

  constructor(table: PgTable<any>, config: PgTimeBuilder["config"]) {
    super(table, config);
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }

  getSQLType(): string {
    const precision = this.precision === undefined ? "" : `(${this.precision})`;
    return `time${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
}

export interface TimeConfig {
  precision?: undefined | Precision;
  withTimezone?: undefined | boolean;
}

export function time(config?: undefined | TimeConfig): PgTimeBuilder;
export function time(name: string, config?: undefined | TimeConfig): PgTimeBuilder;
export function time(a?: undefined | string | TimeConfig, b: TimeConfig = {}) {
  const { name, config } = getColumnNameAndConfig<TimeConfig>(a, b);
  return new PgTimeBuilder(name, config.withTimezone ?? false, config.precision);
}
