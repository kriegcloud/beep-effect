// trick the type-system so we can use the schema like an object
// TODO: If the new API works, maybe we don't need to do this?

import type { PRODUCTION_ALREADY_EXISTS_BEHAVIOR } from "@beep/rete/network";

export type Pojo = { [key: string]: object };
export type ConditionOptions<T> = { then?: boolean; match?: T; join?: string };
export type Condition<TSchema extends object> = {
  [ATTR in keyof TSchema]: ConditionOptions<TSchema[ATTR]>;
};
export type ConditionArgs<TSchema extends object> = {
  [key: string]: {
    [ATTR in keyof Partial<TSchema>]: ConditionOptions<TSchema[ATTR]> | undefined;
  };
};

export type EnactArgs<TSchema extends object, T extends ConditionArgs<TSchema>> = {
  [Key in keyof T]: {
    [ATTR in keyof Required<T[Key]>]: ATTR extends keyof TSchema ? TSchema[ATTR] : never;
  } & { id: string };
};

export type QueryArgs<TSchema extends object, T extends ConditionArgs<TSchema>> = {
  [Key in keyof T]?: {
    [ATTR in keyof Partial<T[Key]>]: ATTR extends keyof TSchema ? TSchema[ATTR][] : never;
  } & { ids?: string[] };
};

/// Wrap the entire what in a function that return something we can enact? Instead of one at a time?
export type InsertBeepFact<TSchema extends object> = {
  [key: string]: { [Key in keyof Partial<TSchema>]: TSchema[Key] };
};

export type BeepArgs = {
  autoFire?: boolean;
};

export type EnactionArgs<TSchema extends object, T extends ConditionArgs<TSchema>> = {
  then?: (args: EnactArgs<TSchema, T>) => Promise<void> | void;
  when?: (args: EnactArgs<TSchema, T>) => boolean;
  thenFinally?: (getResults: () => EnactArgs<TSchema, T>[]) => Promise<void> | void;
};

export interface QueryOneOptions {
  shouldThrowExceptionOnMoreThanOne?: boolean;
}

export type EnactionResults<TSchema extends object, T extends ConditionArgs<TSchema>> = {
  query: (filter?: QueryArgs<TSchema, T>) => EnactArgs<TSchema, T>[];
  queryOne: (filter?: QueryArgs<TSchema, T>, options?: QueryOneOptions) => EnactArgs<TSchema, T> | undefined;
  subscribe: (fn: (results: EnactArgs<TSchema, T>[]) => void, filter?: QueryArgs<TSchema, T>) => () => void;

  subscribeOne: (
    fn: (results: EnactArgs<TSchema, T> | undefined) => void,
    filter?: QueryArgs<TSchema, T>,
    options?: QueryOneOptions
  ) => () => void;
};
export type Enact<TSchema extends object, T extends ConditionArgs<TSchema>> = (
  enaction?: EnactionArgs<TSchema, T>
) => EnactionResults<TSchema, T>;

export interface IBeep<TSchema extends object> {
  insert: (args: InsertBeepFact<TSchema>) => void;
  get: <ATTR extends keyof TSchema>(id: string, attr: ATTR) => TSchema[ATTR] | undefined;
  retract: (id: string, ...attrs: (keyof TSchema)[]) => void;
  retractByConditions: (id: string, conditions: { [key in keyof TSchema]?: any }) => void;
  fire: (recursionLimit?: number) => void;
  reset: () => void;
  conditions: <
    T extends {
      [ATTR in keyof Partial<TSchema>]: ConditionOptions<TSchema[ATTR]> | undefined;
    },
  >(
    conds: (schema: Condition<TSchema>) => T
  ) => T;
  rule: <T extends ConditionArgs<TSchema>>(
    name: string,
    conditions: (schema: Condition<TSchema>) => T,
    onAlreadyExistsBehaviour?: PRODUCTION_ALREADY_EXISTS_BEHAVIOR
  ) => { enact: Enact<TSchema, T> };
  perf: () => {
    frames: PerformanceEntryList[];
    capture: () => PerformanceEntryList;
  };
  dotFile: () => string;
}
