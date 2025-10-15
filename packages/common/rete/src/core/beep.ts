import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Struct from "effect/Struct";
import { get as lodashGet, set as lodashSet } from "lodash-es";
import type { $Schema, Auditor, ConvertMatchFn, FactFragment } from "../network";
import { Field, PRODUCTION_ALREADY_EXISTS_BEHAVIOR, rete, viz } from "../network";
import {
  IncorrectJoinUsage,
  InvalidOptionsForCondition,
  QueryOneReturnedMoreThanOne,
  SubscribeOneMoreThanOne,
} from "./errors";
import type {
  Condition,
  ConditionArgs,
  ConditionOptions,
  EnactArgs,
  EnactionArgs,
  IBeep,
  InsertBeepFact,
  QueryArgs,
  QueryOneOptions,
} from "./types";
import { insertFactToFact } from "./utils";

const ID_PREFIX = "id___";
const VALUE_PREFIX = "val___";
const idPrefix = (i: string) => `${ID_PREFIX}${i}`;

const extractId = (id: string) => (id.startsWith("$") ? { name: idPrefix(id), field: Field.Enum.IDENTIFIER } : id);

const valueKey = ({ id, attr }: { id: string; attr: string | number | symbol }) =>
  `${VALUE_PREFIX}${id}_${String(attr)}`;

export const beep = <TSchema extends $Schema>(autoFire = true, auditor?: Auditor): IBeep<TSchema> => {
  let session = rete.initSession<TSchema>(autoFire, auditor);
  const reset = () => {
    session = rete.initSession<TSchema>(autoFire, auditor);
  };
  const insert = (insertFacts: InsertBeepFact<TSchema>) => {
    // be dumb about this
    const factTuples = insertFactToFact(insertFacts);

    A.forEach(factTuples, (tuple) => rete.insertFact<TSchema>(session, tuple));
  };
  const retract = (id: string, ...attrs: (keyof TSchema)[]) =>
    A.forEach(attrs, (attr) => rete.retractFactByIdAndAttr<TSchema>(session, id, attr));

  const get = <T extends keyof TSchema>(id: string, attr: T) => {
    return rete.retrieveFactValueByIdAttr(session, id, attr);
  };

  const getOption = <T extends keyof TSchema>(id: string, attr: T) => O.fromNullable(get(id, attr));

  const retractByConditions = (id: string, conditions: { [key in keyof TSchema]?: UnsafeTypes.UnsafeAny }) => {
    retract(id, ...Struct.keys(conditions));
  };

  const conditions = <
    T extends {
      readonly [ATTR in keyof Partial<TSchema>]: ConditionOptions<TSchema[ATTR]> | undefined;
    },
  >(
    conds: (schema: Condition<TSchema>) => T
  ): T => {
    const schema: Condition<TSchema> = {} as Condition<TSchema>;
    return conds(schema);
  };

  const rule = <T extends ConditionArgs<TSchema>>(
    name: string,
    conditions: (schema: Condition<TSchema>) => T,
    onAlreadyExistsBehaviour = PRODUCTION_ALREADY_EXISTS_BEHAVIOR.ERROR
  ) => {
    const onAlreadyExists = onAlreadyExistsBehaviour;
    const convertMatchFn: ConvertMatchFn<TSchema, EnactArgs<TSchema, T>> = (args) => {
      // This is where we need to convert the dictionary to the
      // js object we want
      const result: EnactArgs<TSchema, T> = {} as EnactArgs<TSchema, T>;

      for (const [k] of args) {
        if (k.startsWith(ID_PREFIX)) {
          const id = k.replace(ID_PREFIX, "");
          lodashSet(result, id, { id: args.get(k) });
        }
      }

      for (const [k] of args) {
        if (k.startsWith(VALUE_PREFIX)) {
          const value = k.replace(VALUE_PREFIX, "");
          const [id, attr] = value.split("_");
          if (lodashGet(result, id!) === undefined) {
            lodashSet(result, id!, { id });
          }
          lodashSet(result, `${id}.${attr}`, args.get(k));
        }
      }

      return result;
    };

    const enact = (enaction?: EnactionArgs<TSchema, T>) => {
      const production = rete.initProduction<TSchema, EnactArgs<TSchema, T>>({
        name: name,
        condFn: (args) => enaction?.when?.(convertMatchFn(args)) ?? true,
        convertMatchFn,
      });
      if (enaction?.then !== undefined) {
        production.thenFn = (args) => enaction?.then?.(args.vars);
      }
      if (enaction?.thenFinally !== undefined) {
        production.thenFinallyFn = (session) => enaction?.thenFinally?.(() => rete.queryAll(session, production));
      }
      const schema = {} as Condition<TSchema>;
      const cond = conditions(schema);
      const keys = Struct.keys(cond);
      A.forEach(keys, (id) => {
        const condForId = (lodashGet(cond, id) ?? {}) as Record<string, ConditionOptions<UnsafeTypes.UnsafeAny>>;
        const attrs = Struct.keys(condForId);
        A.forEach(attrs, (attr) => {
          const options: ConditionOptions<unknown> | undefined = lodashGet(cond, `${id}.${String(attr)}`);
          const conditionId = extractId(id);

          const join = options?.join;
          const match = options?.match;

          if (join && match) throw new InvalidOptionsForCondition(conditionId);

          const joinExists = join
            ? F.pipe(
                keys,
                A.some((candidate) => candidate === join)
              )
            : false;

          if (join && !joinExists) {
            throw new IncorrectJoinUsage(cond);
          }

          let conditionValue: UnsafeTypes.UnsafeAny;
          if (match !== undefined) {
            conditionValue = match;
          } else if (join) {
            conditionValue = {
              name: idPrefix(join),
              field: Field.Enum.VALUE,
            };
          } else {
            conditionValue = {
              name: valueKey({ id, attr }),
              field: Field.Enum.VALUE,
            };
          }

          rete.addConditionsToProduction(production, conditionId, attr, conditionValue, options?.then ?? true);
        });
      });

      rete.addProductionToSession(session, production, onAlreadyExists);
      const convertFilterArgs = (filter: QueryArgs<TSchema, T>) => {
        const filters = new Map<string, FactFragment<TSchema>[]>();
        const joinIds = Struct.keys(filter);

        for (const joinId of joinIds) {
          const joinFilter = filter[joinId];
          if (!joinFilter) continue;

          // ids filter
          if (A.isArray(joinFilter.ids) && joinFilter.ids.length > 0) {
            const idKey = idPrefix(joinId);
            filters.set(idKey, joinFilter.ids);
          }

          const rest = joinFilter;
          for (const attr of Struct.keys(rest)) {
            const values = rest[attr];
            if (!values || values.length === 0) continue;
            const attrKey = valueKey({ id: joinId, attr });
            filters.set(attrKey, values);
          }
        }
        return filters;
      };

      const query = (filter?: QueryArgs<TSchema, T>) => {
        if (!filter) return rete.queryAll(session, production);
        return rete.queryAll(session, production, convertFilterArgs(filter));
      };

      const queryOne = (filter?: QueryArgs<TSchema, T>, options?: QueryOneOptions) => {
        const result = query(filter);
        if (result.length > 1 && options?.shouldThrowExceptionOnMoreThanOne) {
          throw new QueryOneReturnedMoreThanOne();
        }

        return result.pop();
      };

      const queryOneOption = (filter?: QueryArgs<TSchema, T>, options?: QueryOneOptions) =>
        O.fromNullable(queryOne(filter, options));
      const subscribe = (fn: (results: EnactArgs<TSchema, T>[]) => void, filter?: QueryArgs<TSchema, T>) =>
        rete.subscribeToProduction(
          session,
          production,
          fn,
          filter !== undefined ? convertFilterArgs(filter) : undefined
        );
      const subscribeOne = (
        fn: (results: EnactArgs<TSchema, T> | undefined) => void,
        filter?: QueryArgs<TSchema, T>,
        options?: QueryOneOptions
      ) =>
        rete.subscribeToProduction(
          session,
          production,
          (results) => {
            if (results.length > 1 && options?.shouldThrowExceptionOnMoreThanOne) {
              throw new SubscribeOneMoreThanOne(results);
            }

            const item = results.pop();
            fn(item);
          },
          filter !== undefined ? convertFilterArgs(filter) : undefined
        );

      const subscribeOneOption = (
        fn: (result: O.Option<EnactArgs<TSchema, T>>) => void,
        filter?: QueryArgs<TSchema, T>,
        options?: QueryOneOptions
      ) =>
        rete.subscribeToProduction(
          session,
          production,
          (results) => {
            if (results.length > 1 && options?.shouldThrowExceptionOnMoreThanOne) {
              throw new SubscribeOneMoreThanOne(results);
            }
            const item = results.pop();
            fn(O.fromNullable(item));
          },
          filter !== undefined ? convertFilterArgs(filter) : undefined
        );

      return {
        query,
        queryOne,
        queryOneOption,
        subscribe,
        subscribeOne,
        subscribeOneOption,
        get,
        getOption,
        rule: production,
      };
    };

    return { enact };
  };

  const fire = (recursionLimit?: number) => rete.fireRules(session, recursionLimit);

  const dotFile = () => viz(session);

  const perf = () => {
    const frames: PerformanceEntryList[] = [];

    const capture = () => {
      const entries = performance.getEntriesByType("measure");
      frames.push(entries);
      performance.clearMeasures();
      performance.clearMarks();
      return entries;
    };

    return {
      frames,
      capture,
    };
  };

  return {
    perf,
    dotFile,
    get,
    getOption,
    insert,
    retract,
    retractByConditions,
    fire,
    conditions,
    rule,
    reset,
  };
};
