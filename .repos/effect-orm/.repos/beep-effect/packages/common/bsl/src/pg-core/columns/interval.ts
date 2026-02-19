import { entityKind } from "../../entity";
import type { PgTable } from "../../pg-core/table";
import { getColumnNameAndConfig } from "../../utils";
import { PgColumn, PgColumnBuilder } from "./common";
import type { Precision } from "./timestamp";

export class PgIntervalBuilder extends PgColumnBuilder<
  {
    dataType: "string interval";
    data: string;
    driverParam: string;
  },
  { intervalConfig: IntervalConfig }
> {
  static override readonly [entityKind]: string = "PgIntervalBuilder";

  constructor(name: string, intervalConfig: IntervalConfig) {
    super(name, "string interval", "PgInterval");
    this.config.intervalConfig = intervalConfig;
  }

  /** @internal */
  override build(table: PgTable<any>) {
    return new PgInterval(table, this.config as any);
  }
}

export class PgInterval extends PgColumn<"string interval"> {
  static override readonly [entityKind]: string = "PgInterval";

  readonly fields: IntervalConfig["fields"];
  readonly precision: IntervalConfig["precision"];

  constructor(table: PgTable<any>, config: PgIntervalBuilder["config"]) {
    super(table, config);
    this.fields = config.intervalConfig.fields;
    this.precision = config.intervalConfig.precision;
  }

  getSQLType(): string {
    const fields = this.fields ? ` ${this.fields}` : "";
    const precision = this.precision ? `(${this.precision})` : "";
    return `interval${fields}${precision}`;
  }
}

export interface IntervalConfig {
  fields?:
    | undefined
    | "year"
    | "month"
    | "day"
    | "hour"
    | "minute"
    | "second"
    | "year to month"
    | "day to hour"
    | "day to minute"
    | "day to second"
    | "hour to minute"
    | "hour to second"
    | "minute to second";
  precision?: undefined | Precision;
}

export function interval(config?: undefined | IntervalConfig): PgIntervalBuilder;
export function interval(name: string, config?: undefined | IntervalConfig): PgIntervalBuilder;
export function interval(a?: undefined | string | IntervalConfig, b: IntervalConfig = {}) {
  const { name, config } = getColumnNameAndConfig<IntervalConfig>(a, b);
  return new PgIntervalBuilder(name, config);
}
