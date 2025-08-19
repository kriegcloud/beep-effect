import * as S from "effect/Schema";
import { Entity, EntityId } from "./internal";
import * as Operators from "./operators";
import { Rule } from "./rules";

export namespace Union {
  export type Type = Entity.Type<
    "union",
    {
      parentId: string;
      logicalOp: Operators.LogicalOp.Type;
      rules: ReadonlyArray<Rule | Type>;
    }
  >;
  export const Schema = Entity.make("union", {
    parentId: EntityId,
    logicalOp: Operators.LogicalOp,
    rules: S.Array(
      S.Union(
        Rule,
        S.suspend((): S.Schema<Type> => Schema),
      ),
    ),
  });
}

export namespace RootUnion {
  export const Schema = Entity.make("rootUnion", {
    logicalOp: Operators.LogicalOp,
    rules: S.Array(S.Union(Rule, Union.Schema)),
  });
  export type Type = typeof Schema.Type;
}

export namespace NewUnion {
  export const Schema = S.Struct({
    logicalOp: Operators.LogicalOp,
  });
  export type Type = typeof Schema.Type;
}
