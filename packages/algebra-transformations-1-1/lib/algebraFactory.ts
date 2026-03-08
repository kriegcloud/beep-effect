import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { stringToTerm } from 'rdf-string';
import * as A from './algebra.js';
import type { PropertyPathSymbol, Update } from './algebra.js';

function known<T extends A.Operation = A.Operation>(x: A.BaseOperation): T;
function known<T extends A.Operation = A.Operation>(x: A.BaseOperation[]): T[];
function known<T extends A.Operation = A.Operation>(
  x: A.BaseOperation | A.BaseOperation[],
): typeof x extends any[] ? T[] : T {
  return <any> x;
}

export class AlgebraFactory {
  public dataFactory: RDF.DataFactory<RDF.BaseQuad, RDF.BaseQuad>;
  public stringType: RDF.NamedNode;

  public constructor(dataFactory?: RDF.DataFactory<RDF.BaseQuad>) {
    this.dataFactory = dataFactory ?? new DataFactory();
    this.stringType = <RDF.NamedNode> this.createTerm('http://www.w3.org/2001/XMLSchema#string');
  }

  public createAlt(input: A.BaseOperation[], flatten = true): A.Alt {
    return this.flattenMulti({
      type: A.Types.ALT,
      input: <PropertyPathSymbol[]> input,
    }, flatten);
  }

  public createAsk(input: A.BaseOperation): A.Ask {
    return { type: A.Types.ASK, input: known(input) };
  }

  public createBoundAggregate(
    variable: RDF.Variable,
    aggregate: string,
    expression: A.BaseExpression,
    distinct: boolean,
    separator?: string,
  ): A.BoundAggregate {
    const result = <A.BoundAggregate> this.createAggregateExpression(
      aggregate,
      known<A.Expression>(expression),
      distinct,
      separator,
    );
    result.variable = variable;
    return result;
  }

  public createBgp(patterns: A.Pattern[]): A.Bgp {
    return { type: A.Types.BGP, patterns };
  }

  public createConstruct(input: A.BaseOperation, template: A.Pattern[]): A.Construct {
    return { type: A.Types.CONSTRUCT, input: known(input), template };
  }

  public createDescribe(input: A.BaseOperation, terms: (RDF.Variable | RDF.NamedNode)[]): A.Describe {
    return { type: A.Types.DESCRIBE, input: known(input), terms };
  }

  public createDistinct(input: A.BaseOperation): A.Distinct {
    return { type: A.Types.DISTINCT, input: known(input) };
  }

  public createExtend(
    input: A.BaseOperation,
    variable: RDF.Variable,
    expression: A.BaseExpression,
  ): A.Extend {
    return { type: A.Types.EXTEND, input: known(input), variable, expression: known(expression) };
  }

  public createFrom(input: A.BaseOperation, def: RDF.NamedNode[], named: RDF.NamedNode[]): A.From {
    return { type: A.Types.FROM, input: known(input), default: def, named };
  }

  public createFilter(input: A.BaseOperation, expression: A.BaseExpression): A.Filter {
    return { type: A.Types.FILTER, input: known(input), expression: known(expression) };
  }

  public createGraph(input: A.BaseOperation, name: RDF.Variable | RDF.NamedNode): A.Graph {
    return { type: A.Types.GRAPH, input: known(input), name };
  }

  public createGroup(
    input: A.BaseOperation,
    variables: RDF.Variable[],
    aggregates: A.BaseOperation[],
  ): A.Group {
    return { type: A.Types.GROUP, input: known(input), variables, aggregates: known(aggregates) };
  }

  public createInv(path: A.BaseOperation): A.Inv {
    return { type: A.Types.INV, path: <PropertyPathSymbol> path };
  }

  public createJoin(input: A.BaseOperation[], flatten = true): A.Join {
    return this.flattenMulti({ type: A.Types.JOIN, input: known(input) }, flatten);
  }

  public createLeftJoin(
    left: A.BaseOperation,
    right: A.BaseOperation,
    expression?: A.BaseExpression,
  ): A.LeftJoin {
    if (expression) {
      return {
        type: A.Types.LEFT_JOIN,
        input: [ known(left), known(right) ],
        expression: known<A.Expression>(expression),
      };
    }
    return { type: A.Types.LEFT_JOIN, input: [ known(left), known(right) ]};
  }

  public createLink(iri: RDF.NamedNode): A.Link {
    return { type: A.Types.LINK, iri };
  }

  public createMinus(left: A.BaseOperation, right: A.BaseOperation): A.Minus {
    return { type: A.Types.MINUS, input: [ known(left), known(right) ]};
  }

  public createNop(): A.Nop {
    return { type: A.Types.NOP };
  }

  public createNps(iris: RDF.NamedNode[]): A.Nps {
    return { type: A.Types.NPS, iris };
  }

  public createOneOrMorePath(path: A.BaseOperation): A.OneOrMorePath {
    return { type: A.Types.ONE_OR_MORE_PATH, path: <PropertyPathSymbol> path };
  }

  public createOrderBy(input: A.BaseOperation, expressions: A.BaseExpression[]): A.OrderBy {
    return { type: A.Types.ORDER_BY, input: known(input), expressions: known(expressions) };
  }

  public createPath(
    subject: RDF.Term,
    predicate: A.BaseOperation,
    object: RDF.Term,
    graph?: RDF.Term,
  ): A.Path {
    if (graph) {
      return { type: A.Types.PATH, subject, predicate: <PropertyPathSymbol> predicate, object, graph };
    }
    return {
      type: A.Types.PATH,
      subject,
      predicate: <PropertyPathSymbol> predicate,
      object,
      graph: this.dataFactory.defaultGraph(),
    };
  }

  public createPattern(subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph?: RDF.Term): A.Pattern {
    const pattern = <A.Pattern> this.dataFactory.quad(subject, predicate, object, graph);
    pattern.type = A.Types.PATTERN;
    return pattern;
  }

  public createProject(input: A.BaseOperation, variables: RDF.Variable[]): A.Project {
    return { type: A.Types.PROJECT, input: known(input), variables };
  }

  public createReduced(input: A.BaseOperation): A.Reduced {
    return { type: A.Types.REDUCED, input: known(input) };
  }

  public createSeq(input: A.BaseOperation[], flatten = true): A.Seq {
    return this.flattenMulti({
      type: A.Types.SEQ,
      input: <PropertyPathSymbol[]> input,
    }, flatten);
  }

  public createService(input: A.BaseOperation, name: RDF.NamedNode | RDF.Variable, silent?: boolean): A.Service {
    return { type: A.Types.SERVICE, input: known(input), name, silent: Boolean(silent) };
  }

  public createSlice(input: A.BaseOperation, start: number, length?: number): A.Slice {
    start = start || 0;
    if (length !== undefined) {
      return { type: A.Types.SLICE, input: known(input), start, length };
    }
    return { type: A.Types.SLICE, input: known(input), start };
  }

  public createUnion(input: A.BaseOperation[], flatten = true): A.Union {
    return this.flattenMulti({ type: A.Types.UNION, input: known(input) }, flatten);
  }

  public createValues(variables: RDF.Variable[], bindings: Record<string, RDF.Literal | RDF.NamedNode>[]): A.Values {
    return { type: A.Types.VALUES, variables, bindings };
  }

  public createZeroOrMorePath(path: A.BaseOperation): A.ZeroOrMorePath {
    return {
      type: A.Types.ZERO_OR_MORE_PATH,
      path: <PropertyPathSymbol> path,
    };
  }

  public createZeroOrOnePath(path: A.BaseOperation): A.ZeroOrOnePath {
    return {
      type: A.Types.ZERO_OR_ONE_PATH,
      path: <PropertyPathSymbol> path,
    };
  }

  public createAggregateExpression(
    aggregator: string,
    expression: A.BaseExpression,
    distinct: boolean,
    separator?: string,
  ): A.AggregateExpression {
    if (separator !== undefined) {
      return {
        type: A.Types.EXPRESSION,
        subType: A.ExpressionTypes.AGGREGATE,
        aggregator: <any> aggregator,
        expression: known(expression),
        separator,
        distinct,
      };
    }
    return {
      type: A.Types.EXPRESSION,
      subType: A.ExpressionTypes.AGGREGATE,
      aggregator: <any> aggregator,
      expression: known(expression),
      distinct,
    };
  }

  public createExistenceExpression(not: boolean, input: A.BaseOperation): A.ExistenceExpression {
    return { type: A.Types.EXPRESSION, subType: A.ExpressionTypes.EXISTENCE, not, input: known(input) };
  }

  public createNamedExpression(name: RDF.NamedNode, args: A.BaseExpression[]): A.NamedExpression {
    return { type: A.Types.EXPRESSION, subType: A.ExpressionTypes.NAMED, name, args: known(args) };
  }

  public createOperatorExpression(operator: string, args: A.BaseExpression[]): A.OperatorExpression {
    return { type: A.Types.EXPRESSION, subType: A.ExpressionTypes.OPERATOR, operator, args: known(args) };
  }

  public createTermExpression(term: RDF.Term): A.TermExpression {
    return { type: A.Types.EXPRESSION, subType: A.ExpressionTypes.TERM, term };
  }

  public createWildcardExpression(): A.WildcardExpression {
    return { type: A.Types.EXPRESSION, subType: A.ExpressionTypes.WILDCARD, wildcard: { type: 'wildcard' }};
  }

  public createTerm(str: string): RDF.Term {
    if (str.startsWith('$')) {
      str = str.replace('$', '?');
    }
    return stringToTerm(str, this.dataFactory);
  }

  // Update functions
  public createCompositeUpdate(updates: A.BaseOperation[]): A.CompositeUpdate {
    return { type: A.Types.COMPOSITE_UPDATE, updates: <Update[]> updates };
  }

  public createDeleteInsert(
    deleteQuads?: A.Pattern[],
    insertQuads?: A.Pattern[],
    where?: A.BaseOperation,
  ): A.DeleteInsert {
    const result: A.DeleteInsert = { type: A.Types.DELETE_INSERT };
    if (deleteQuads) {
      result.delete = deleteQuads;
    }
    if (insertQuads) {
      result.insert = insertQuads;
    }
    if (where) {
      result.where = known(where);
    }
    return result;
  }

  public createLoad(source: RDF.NamedNode, destination?: RDF.NamedNode, silent?: boolean): A.Load {
    const result: A.Load = { type: A.Types.LOAD, source };
    if (destination) {
      result.destination = destination;
    }
    return this.addSilent(result, Boolean(silent));
  }

  public createClear(source: 'DEFAULT' | 'NAMED' | 'ALL' | RDF.NamedNode, silent?: boolean): A.Clear {
    return this.addSilent({ type: A.Types.CLEAR, source }, Boolean(silent));
  }

  public createCreate(source: RDF.NamedNode, silent?: boolean): A.Create {
    return this.addSilent({ type: A.Types.CREATE, source }, Boolean(silent));
  }

  public createDrop(source: 'DEFAULT' | 'NAMED' | 'ALL' | RDF.NamedNode, silent?: boolean): A.Drop {
    return this.addSilent({ type: A.Types.DROP, source }, Boolean(silent));
  }

  public createAdd(source: 'DEFAULT' | RDF.NamedNode, destination: 'DEFAULT' | RDF.NamedNode, silent?: boolean): A.Add {
    return this.addSilent({
      type: A.Types.ADD,
      source,
      destination,
    }, Boolean(silent));
  }

  public createMove(
    source: 'DEFAULT' | RDF.NamedNode,
    destination: 'DEFAULT' | RDF.NamedNode,
    silent?: boolean,
  ): A.Move {
    return this.addSilent({
      type: A.Types.MOVE,
      source,
      destination,
    }, Boolean(silent));
  }

  public createCopy(
    source: 'DEFAULT' | RDF.NamedNode,
    destination: 'DEFAULT' | RDF.NamedNode,
    silent?: boolean,
  ): A.Copy {
    return this.addSilent({
      type: A.Types.COPY,
      source,
      destination,
    }, Boolean(silent));
  }

  private addSilent<T extends A.UpdateGraph>(input: T, silent: boolean): T {
    if (silent) {
      input.silent = silent;
    }
    return input;
  }

  private flattenMulti<T extends A.Multi>(input: T, flatten: boolean): T {
    if (!flatten) {
      return input;
    }
    const type = input.type;
    const subType = input.subType;
    const children = input.input;
    const newChildren: A.Operation[] = [];
    for (const child of children) {
      if (child.type === type && (!subType || subType === child.subType)) {
        newChildren.push(...(<A.Multi> child).input);
      } else {
        newChildren.push(child);
      }
    }
    input.input = newChildren;
    return input;
  }
}
