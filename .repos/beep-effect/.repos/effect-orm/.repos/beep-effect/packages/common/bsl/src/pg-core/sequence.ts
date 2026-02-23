import { entityKind, is } from "../entity";

export type PgSequenceOptions = {
  increment?: undefined | number | string;
  minValue?: undefined | number | string;
  maxValue?: undefined | number | string;
  startWith?: undefined | number | string;
  cache?: undefined | number | string;
  cycle?: undefined | boolean;
};

export class PgSequence {
  static readonly [entityKind]: string = "PgSequence";

  constructor(
    public readonly seqName: string | undefined,
    public readonly seqOptions: PgSequenceOptions | undefined,
    public readonly schema: string | undefined
  ) {}
}

export function pgSequence(name: string, options?: undefined | PgSequenceOptions): PgSequence {
  return pgSequenceWithSchema(name, options, undefined);
}

/** @internal */
export function pgSequenceWithSchema(
  name: string,
  options?: undefined | PgSequenceOptions,
  schema?: undefined | string
): PgSequence {
  return new PgSequence(name, options, schema);
}

export function isPgSequence(obj: unknown): obj is PgSequence {
  return is(obj, PgSequence);
}
