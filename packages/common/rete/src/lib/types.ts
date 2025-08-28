// trick the type-system so we can use the schema like an object
// TODO: If the new API works, maybe we don't need to do this?

import type { PRODUCTION_ALREADY_EXISTS_BEHAVIOR } from "@beep/rete/rete";

export type Pojo = { [key: string]: object };
export type ConditionOptions<T> = { then?: boolean; match?: T; join?: string };
export type Condition<SCHEMA extends object> = {
  [ATTR in keyof SCHEMA]: ConditionOptions<SCHEMA[ATTR]>;
};
export type ConditionArgs<SCHEMA extends object> = {
  [key: string]: {
    [ATTR in keyof Partial<SCHEMA>]: ConditionOptions<SCHEMA[ATTR]> | undefined;
  };
};

export type EnactArgs<SCHEMA extends object, T extends ConditionArgs<SCHEMA>> = {
  [Key in keyof T]: {
    [ATTR in keyof Required<T[Key]>]: ATTR extends keyof SCHEMA ? SCHEMA[ATTR] : never;
  } & { id: string };
};

export type QueryArgs<SCHEMA extends object, T extends ConditionArgs<SCHEMA>> = {
  [Key in keyof T]?: {
    [ATTR in keyof Partial<T[Key]>]: ATTR extends keyof SCHEMA ? SCHEMA[ATTR][] : never;
  } & { ids?: string[] };
};

/// Wrap the entire what in a function that return something we can enact? Instead of one at a time?
export type InsertBeepFact<SCHEMA extends object> = {
  [key: string]: { [Key in keyof Partial<SCHEMA>]: SCHEMA[Key] };
};

export type BeepArgs = {
  autoFire?: boolean;
};

export type EnactionArgs<SCHEMA extends object, T extends ConditionArgs<SCHEMA>> = {
  then?: (args: EnactArgs<SCHEMA, T>) => Promise<void> | void;
  when?: (args: EnactArgs<SCHEMA, T>) => boolean;
  thenFinally?: (getResults: () => EnactArgs<SCHEMA, T>[]) => Promise<void> | void;
};

export interface QueryOneOptions {
  shouldThrowExceptionOnMoreThanOne?: boolean;
}
export type EnactionResults<SCHEMA extends object, T extends ConditionArgs<SCHEMA>> = {
  query: (filter?: QueryArgs<SCHEMA, T>) => EnactArgs<SCHEMA, T>[];
  queryOne: (filter?: QueryArgs<SCHEMA, T>, options?: QueryOneOptions) => EnactArgs<SCHEMA, T> | undefined;
  subscribe: (fn: (results: EnactArgs<SCHEMA, T>[]) => void, filter?: QueryArgs<SCHEMA, T>) => () => void;

  subscribeOne: (
    fn: (results: EnactArgs<SCHEMA, T> | undefined) => void,
    filter?: QueryArgs<SCHEMA, T>,
    options?: QueryOneOptions
  ) => () => void;
};
export type Enact<SCHEMA extends object, T extends ConditionArgs<SCHEMA>> = (
  enaction?: EnactionArgs<SCHEMA, T>
) => EnactionResults<SCHEMA, T>;

export interface IBeep<SCHEMA extends object> {
  insert: (args: InsertBeepFact<SCHEMA>) => void;
  get: <ATTR extends keyof SCHEMA>(id: string, attr: ATTR) => SCHEMA[ATTR] | undefined;
  retract: (id: string, ...attrs: (keyof SCHEMA)[]) => void;
  retractByConditions: (id: string, conditions: { [key in keyof SCHEMA]?: any }) => void;
  fire: (recursionLimit?: number) => void;
  reset: () => void;
  conditions: <
    T extends {
      [ATTR in keyof Partial<SCHEMA>]: ConditionOptions<SCHEMA[ATTR]> | undefined;
    },
  >(
    conds: (schema: Condition<SCHEMA>) => T
  ) => T;
  rule: <T extends ConditionArgs<SCHEMA>>(
    name: string,
    conditions: (schema: Condition<SCHEMA>) => T,
    onAlreadyExistsBehaviour?: PRODUCTION_ALREADY_EXISTS_BEHAVIOR
  ) => { enact: Enact<SCHEMA, T> };
}
