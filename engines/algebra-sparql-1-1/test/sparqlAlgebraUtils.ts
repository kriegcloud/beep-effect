import { ExpressionTypes, Types, AlgebraFactory } from '@traqula/algebra-transformations-1-1';
import type { Algebra } from '@traqula/algebra-transformations-1-1';

/**
 * Recurses through the given algebra tree
 * A map of callback functions can be provided for individual Operation Types to gather data.
 * The return value of those callbacks should indicate whether recursion should be applied or not.
 * Making modifications will change the original input object.
 * @param {Operation} op - The Operation to recurse on.
 * @param { [type: string]: (op: Operation) => boolean } callbacks - A map of required callback Operations.
 */
export function recurseOperation(
  op: Algebra.Operation,
  callbacks: {[T in Types]?: (op: Algebra.TypedOperation<T>,) => boolean },
): void {
  const result = op;
  let doRecursion = true;

  const callback = callbacks[<Types> op.type];
  if (callback) {
    doRecursion = callback(<any> op);
  }

  if (!doRecursion) {
    return;
  }

  const recurseOp = (op: Algebra.Operation): void => recurseOperation(op, callbacks);

  switch (result.type) {
    case Types.ALT:
      result.input.map(recurseOp);
      break;
    case Types.ASK:
      recurseOp(result.input);
      break;
    case Types.BGP:
      for (const op1 of result.patterns) {
        recurseOp(op1);
      }
      break;
    case Types.CONSTRUCT:
      recurseOp(result.input);
      result.template.map(recurseOp);
      break;
    case Types.DESCRIBE:
      recurseOp(result.input);
      break;
    case Types.DISTINCT:
      recurseOp(result.input);
      break;
    case Types.EXPRESSION:
      if (result.subType === ExpressionTypes.EXISTENCE) {
        recurseOp(result.input);
      }
      break;
    case Types.EXTEND:
      recurseOp(result.input);
      recurseOp(result.expression);
      break;
    case Types.FILTER:
      recurseOp(result.input);
      recurseOp(result.expression);
      break;
    case Types.FROM:
      recurseOp(result.input);
      break;
    case Types.GRAPH:
      recurseOp(result.input);
      break;
    case Types.GROUP:
      recurseOp(result.input);
      for (const op1 of result.aggregates) {
        recurseOp(op1);
      }
      break;
    case Types.INV:
      recurseOp(result.path);
      break;
    case Types.JOIN:
      result.input.map(recurseOp);
      break;
    case Types.LEFT_JOIN:
      result.input.map(recurseOp);
      if (result.expression) {
        recurseOp(result.expression);
      }
      break;
    case Types.LINK:
      break;
    case Types.MINUS:
      result.input.map(recurseOp);
      break;
    case Types.NOP:
      break;
    case Types.NPS:
      break;
    case Types.ONE_OR_MORE_PATH:
      recurseOp(result.path);
      break;
    case Types.ORDER_BY:
      recurseOp(result.input);
      for (const op1 of result.expressions) {
        recurseOp(op1);
      }
      break;
    case Types.PATH:
      recurseOp(result.predicate);
      break;
    case Types.PATTERN:
      break;
    case Types.PROJECT:
      recurseOp(result.input);
      break;
    case Types.REDUCED:
      recurseOp(result.input);
      break;
    case Types.SEQ:
      result.input.map(recurseOp);
      break;
    case Types.SERVICE:
      recurseOp(result.input);
      break;
    case Types.SLICE:
      recurseOp(result.input);
      break;
    case Types.UNION:
      result.input.map(recurseOp);
      break;
    case Types.VALUES:
      break;
    case Types.ZERO_OR_MORE_PATH:
      recurseOp(result.path);
      break;
    case Types.ZERO_OR_ONE_PATH:
      recurseOp(result.path);
      break;
    // UPDATE operations
    case Types.COMPOSITE_UPDATE:
      for (const update of result.updates) {
        recurseOp(update);
      }
      break;
    case Types.DELETE_INSERT:
      if (result.delete) {
        for (const pattern of result.delete) {
          recurseOp(pattern);
        }
      }
      if (result.insert) {
        for (const pattern of result.insert) {
          recurseOp(pattern);
        }
      }
      if (result.where) {
        recurseOp(result.where);
      }
      break;
    // All of these only have graph IDs as values
    case Types.LOAD: break;
    case Types.CLEAR: break;
    case Types.CREATE: break;
    case Types.DROP: break;
    case Types.ADD: break;
    case Types.MOVE: break;
    case Types.COPY: break;
    default: throw new Error(`Unknown Operation type ${(<any> result).type}`);
  }
}

/**
 * @interface RecurseResult
 * @property {Operation} result - The resulting A.Operation.
 * @property {boolean} recurse - Whether to continue with recursion.
 * @property {boolean} copyMetadata - If the metadata object should be copied. Defaults to true.
 */
export interface RecurseResult {
  result: Algebra.Operation;
  recurse: boolean;
  copyMetadata?: boolean;
}

/**
 * @interface ExpressionRecurseResult
 * @property {Expression} result - The resulting A.Expression.
 * @property {boolean} recurse - Whether to continue with recursion.
 * @property {boolean} copyMetadata - If the metadata object should be copied. Defaults to true.
 */
export interface ExpressionRecurseResult {
  result: Algebra.Expression;
  recurse: boolean;
  copyMetadata?: boolean;
}

/**
 * Creates a deep copy of the given Operation.
 * Creates shallow copies of the non-Operation values.
 * A map of callback functions can be provided for individual Operation Types
 * to specifically modify the given objects before triggering recursion.
 * The return value of those callbacks should indicate whether recursion should be applied to
 * this returned object or not.
 * @param {Operation} op - The Operation to recurse on.
 * @param callbacks - A map of required callback Operations.
 * @param {Factory} factory - Factory used to create new Operations. Will use default factory if none is provided.
 * @returns {Operation} - The copied result.
 */
export function mapOperationOld(
  op: Algebra.Operation,
  callbacks: {
    [T in Types]?: (op: Algebra.TypedOperation<T>, factory: AlgebraFactory) => RecurseResult } &
    {[T in ExpressionTypes]?: (expr: Algebra.TypedExpression<T>, factory: AlgebraFactory) => ExpressionRecurseResult },
  factory?: AlgebraFactory,
): Algebra.Operation {
  let result = op;
  let doRecursion = true;
  let copyMetadata = true;

  factory = factory ?? new AlgebraFactory();

  const callback = callbacks[<Types> op.type];
  if (callback) {
    // Not sure how to get typing correct for op here
    const recurseResult = callback(<any> op, factory);
    result = <any> recurseResult.result;
    doRecursion = recurseResult.recurse;
    copyMetadata = recurseResult.copyMetadata !== false;
  }

  let toCopyMetadata;
  if (copyMetadata && ((<any> result).metadata ?? (<any> op).metadata)) {
    toCopyMetadata = { ...(<any> result).metadata, ...(<any> op).metadata };
  }

  if (!doRecursion) {
    // Inherit metadata
    if (toCopyMetadata) {
      (<any> result).metadata = toCopyMetadata;
    }

    return result;
  }

  const mapOp = (op: Algebra.Operation): Algebra.Operation =>
    mapOperationOld(op, callbacks, factory);

  // Several casts here might be wrong though depending on the callbacks output
  switch (result.type) {
    case Types.ALT:
      result = factory.createAlt(<any> result.input.map(mapOp));
      break;
    case Types.ASK:
      result = factory.createAsk(mapOp(result.input));
      break;
    case Types.BGP:
      result = factory.createBgp(<Algebra.Pattern[]> result.patterns.map(mapOp));
      break;
    case Types.CONSTRUCT:
      result = factory.createConstruct(mapOp(result.input), <Algebra.Pattern[]> result.template.map(mapOp));
      break;
    case Types.DESCRIBE:
      result = factory.createDescribe(mapOp(result.input), result.terms);
      break;
    case Types.DISTINCT:
      result = factory.createDistinct(mapOp(result.input));
      break;
    case Types.EXPRESSION:
      result = <any> mapExpression(result, callbacks, factory);
      break;
    case Types.EXTEND:
      result = factory.createExtend(
        mapOp(result.input),
        result.variable,
        <Algebra.Expression> mapOp(result.expression),
      );
      break;
    case Types.FILTER:
      result = factory.createFilter(mapOp(result.input), <Algebra.Expression> mapOp(result.expression));
      break;
    case Types.FROM:
      result = factory.createFrom(mapOp(result.input), [ ...result.default ], [ ...result.named ]);
      break;
    case Types.GRAPH:
      result = factory.createGraph(mapOp(result.input), result.name);
      break;
    case Types.GROUP:
      result = factory.createGroup(
        mapOp(result.input),
        [ ...result.variables ],
        <Algebra.BoundAggregate[]> result.aggregates.map(mapOp),
      );
      break;
    case Types.INV:
      result = factory.createInv(<any> mapOp(result.path));
      break;
    case Types.JOIN:
      result = factory.createJoin(result.input.map(mapOp));
      break;
    case Types.LEFT_JOIN:
      result = factory.createLeftJoin(
        mapOp(result.input[0]),
        mapOp(result.input[1]),
        result.expression ? <Algebra.Expression> mapOp(result.expression) : undefined,
      );
      break;
    case Types.LINK:
      result = factory.createLink(result.iri);
      break;
    case Types.MINUS:
      result = factory.createMinus(mapOp(result.input[0]), mapOp(result.input[1]));
      break;
    case Types.NOP:
      result = factory.createNop();
      break;
    case Types.NPS:
      result = factory.createNps([ ...result.iris ]);
      break;
    case Types.ONE_OR_MORE_PATH:
      result = factory.createOneOrMorePath(<any> mapOp(result.path));
      break;
    case Types.ORDER_BY:
      result = factory.createOrderBy(mapOp(result.input), <Algebra.Expression[]> result.expressions.map(mapOp));
      break;
    case Types.PATH:
      result = factory.createPath(
        result.subject,
        <any> mapOp(result.predicate),
        result.object,
        result.graph,
      );
      break;
    case Types.PATTERN:
      result = factory.createPattern(result.subject, result.predicate, result.object, result.graph);
      break;
    case Types.PROJECT:
      result = factory.createProject(mapOp(result.input), [ ...result.variables ]);
      break;
    case Types.REDUCED:
      result = factory.createReduced(mapOp(result.input));
      break;
    case Types.SEQ:
      result = factory.createSeq(<any> result.input.map(mapOp));
      break;
    case Types.SERVICE:
      result = factory.createService(mapOp(result.input), result.name, result.silent);
      break;
    case Types.SLICE:
      result = factory.createSlice(mapOp(result.input), result.start, result.length);
      break;
    case Types.UNION:
      result = factory.createUnion(result.input.map(mapOp));
      break;
    case Types.VALUES:
      result = factory.createValues(
        [ ...result.variables ],
        result.bindings.map(b => ({ ...b })),
      );
      break;
    case Types.ZERO_OR_MORE_PATH:
      result = factory.createZeroOrMorePath(<any> mapOp(result.path));
      break;
    case Types.ZERO_OR_ONE_PATH:
      result = factory.createZeroOrOnePath(<any> mapOp(result.path));
      break;
    // UPDATE operations
    case Types.COMPOSITE_UPDATE:
      result = factory.createCompositeUpdate(<Algebra.Update[]> result.updates.map(mapOp));
      break;
    case Types.DELETE_INSERT:
      result = factory.createDeleteInsert(
        result.delete ? <Algebra.Pattern[]> result.delete.map(mapOp) : undefined,
        result.insert ? <Algebra.Pattern[]> result.insert.map(mapOp) : undefined,
        result.where ? mapOp(result.where) : undefined,
      );
      break;
    case Types.LOAD:
      result = factory.createLoad(result.source, result.destination, result.silent);
      break;
    case Types.CLEAR:
      result = factory.createClear(result.source, result.silent);
      break;
    case Types.CREATE:
      result = factory.createCreate(result.source, result.silent);
      break;
    case Types.DROP:
      result = factory.createDrop(result.source, result.silent);
      break;
    case Types.ADD:
      result = factory.createAdd(result.source, result.destination);
      break;
    case Types.MOVE:
      result = factory.createMove(result.source, result.destination);
      break;
    case Types.COPY:
      result = factory.createCopy(result.source, result.destination);
      break;
    default: throw new Error(`Unknown Operation type ${(<any> result).type}`);
  }

  // Inherit metadata
  if (toCopyMetadata) {
    (<any> result).metadata = toCopyMetadata;
  }

  return result;
}

/**
 * Similar to the {@link mapOperation} function but specifically for expressions.
 * Both functions call each other while copying.
 * Should not be called directly since it does not execute the callbacks, these happen in {@link mapOperation}.
 * @param {Expression} expr - The Operation to recurse on.
 * @param callbacks - A map of required callback Operations.
 * @param {Factory} factory - Factory used to create new Operations. Will use default factory if none is provided.
 * @returns {Operation} - The copied result.
 */
export function mapExpression(
  expr: Algebra.Expression,
  callbacks: {[T in Types]?: (op: Algebra.TypedOperation<T>, factory: AlgebraFactory) => RecurseResult }
    & {[T in ExpressionTypes]?: (expr: Algebra.TypedExpression<T>, factory: AlgebraFactory) =>
    ExpressionRecurseResult },
  factory?: AlgebraFactory,
): Algebra.Expression {
  let result = expr;
  let doRecursion = true;

  factory = factory ?? new AlgebraFactory();

  const callback = callbacks[<ExpressionTypes> expr.subType];
  if (callback) {
    ({ result, recurse: doRecursion } = <any> callback(<any>expr, factory));
  }

  if (!doRecursion) {
    return result;
  }

  const mapOp = (op: Algebra.Operation): Algebra.Operation =>
    mapOperationOld(op, callbacks, factory);

  switch (result.subType) {
    case ExpressionTypes.AGGREGATE:
      if ('variable' in result) {
        return factory.createBoundAggregate(
          result.variable,
          result.aggregator,
          <Algebra.Expression> mapOp(result.expression),
          result.distinct,
          result.separator,
        );
      }
      return factory.createAggregateExpression(
        result.aggregator,
        <Algebra.Expression> mapOp(result.expression),
        result.distinct,
        result.separator,
      );
    case ExpressionTypes.EXISTENCE:
      return factory.createExistenceExpression(result.not, mapOp(result.input));
    case ExpressionTypes.NAMED:
      return factory.createNamedExpression(result.name, <Algebra.Expression[]> result.args.map(mapOp));
    case ExpressionTypes.OPERATOR:
      return factory.createOperatorExpression(result.operator, <Algebra.Expression[]> result.args.map(mapOp));
    case ExpressionTypes.TERM:
      return factory.createTermExpression(result.term);
    case ExpressionTypes.WILDCARD:
      return factory.createWildcardExpression();
    default: throw new Error(`Unknown Expression type ${(<any> expr).expressionType}`);
  }
}
