import { entityKind } from "../../entity";
import type { PgTable } from "../../pg-core/table";
import { PgColumn, PgColumnBuilder } from "./common";

export class PgSmallSerialBuilder extends PgColumnBuilder<{
  dataType: "number int16";
  data: number;
  driverParam: number;
  notNull: true;
  hasDefault: true;
}> {
  static override readonly [entityKind]: string = "PgSmallSerialBuilder";

  constructor(name: string) {
    super(name, "number int16", "PgSmallSerial");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }

  /** @internal */
  override build(table: PgTable<any>) {
    return new PgSmallSerial(table, this.config as any);
  }
}

export class PgSmallSerial extends PgColumn<"number int16"> {
  static override readonly [entityKind]: string = "PgSmallSerial";

  getSQLType(): string {
    return "smallserial";
  }
}

export function smallserial(name?: undefined | string): PgSmallSerialBuilder {
  return new PgSmallSerialBuilder(name ?? "");
}
