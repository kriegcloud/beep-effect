import { entityKind } from "../../entity";
import type { PgTable } from "../table";
import { PgColumn, PgColumnBuilder } from "./common";

export class PgInetBuilder extends PgColumnBuilder<{
  dataType: "string inet";
  data: string;
  driverParam: string;
}> {
  static override readonly [entityKind]: string = "PgInetBuilder";

  constructor(name: string) {
    super(name, "string inet", "PgInet");
  }

  /** @internal */
  override build(table: PgTable<any>) {
    return new PgInet(table, this.config as any);
  }
}

export class PgInet extends PgColumn<"string inet"> {
  static override readonly [entityKind]: string = "PgInet";

  getSQLType(): string {
    return "inet";
  }
}

export function inet(name?: undefined | string): PgInetBuilder {
  return new PgInetBuilder(name ?? "");
}
