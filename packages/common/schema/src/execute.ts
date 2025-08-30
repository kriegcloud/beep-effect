import type {
  StringTypes,
  StructTypes,
  //  UnsafeTypes
} from "@beep/types";
import type * as S from "effect/Schema";
import { DiscriminatedStruct } from "./generics";
// import * as Data from "effect/Data";
// import type { Paths } from "type-fest";
export namespace Event {
  export type Schema<
    EventType extends StringTypes.NonEmptyString<string>,
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > = DiscriminatedStruct.Schema<"type", EventType, Fields>;

  export type Type<
    EventType extends StringTypes.NonEmptyString<string>,
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > = S.Schema.Type<Schema<EventType, Fields>>;

  // export type Handler<T = Type> = (
  //   event: T,
  //
  // )
}

// type AlmanacOptions = {
//   readonly allowUndefinedFacts?: undefined | boolean;
//   readonly pathResolver?: undefined | (<T extends UnsafeTypes.UnsafeRecord>(object: T, path: Paths<T>) => unknown);
// }
export type FactOptions = {
  cache?: undefined | boolean;
  priority?: undefined | number;
};

// export class Almanac extends Data.TaggedClass("Almanac")<{
//   factValue: <T>(factId: string,
//     params?: Record<string, any>,
//     path?: string) => Promise<T>
//   addFact:
//     | (<T>(fact: Fact<T>) => Almanac)
//     | (<T>(id: string, valueCallback: DynamicFactCallback<T> | T, options?: FactOptions) => Almanac)
//   addRuntimeFact: (factId: string, value: any) => void
// }> {
//   constructor(options?: AlmanacOptions);
//
//   addFact<T>(fact: Fact<T>): this;
//   addFact<T>(id: string, valueCallback: DynamicFactCallback<T> | T, options?: FactOptions): this;
//   addRuntimeFact(factId: string, value: any): void;
// }
// export type DynamicFactCallback<T = unknown> = (
//   params: Record<string, any>,
//   almanac: Almanac
// ) => T;
// export class Fact<T = unknown> extends Data.TaggedClass("Fact")<{
//   id: string;
//   priority: number;
//   options: FactOptions;
//   value?: T;
//   calculationMethod?: DynamicFactCallback<T>
// }> {
//
//   constructor(
//     id: string,
//     value: T | DynamicFactCallback<T>,
//     options?: FactOptions
//   ) {
//     super({
//       id,
//       priority: options?.priority ?? 0,
//       options: options ?? {},
//       value: value as T,
//     })
//   }
// }

export const Event = <const EventType extends string, const Fields extends StructTypes.StructFieldsWithStringKeys>(
  eventType: StringTypes.NonEmptyString<EventType>,
  fields: Fields
) => {
  return DiscriminatedStruct("type")(eventType, fields);
};
