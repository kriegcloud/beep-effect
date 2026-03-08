import type { SourceLocation, SubTyped, Typed } from '@traqula/core';
import { AstCoreFactory } from '@traqula/core';
import { ContextFactoryMixin } from './factoryMixins/ContextFactory.js';
import { ExpressionFactoryMixin } from './factoryMixins/ExpressionFactory.js';
import { GraphRefFactoryMixin } from './factoryMixins/GraphRefFactory.js';
import { asArg } from './factoryMixins/mixins.js';
import { PathFactoryMixin } from './factoryMixins/PathFactory.js';
import { PatternFactoryMixin } from './factoryMixins/Patternfactory.js';
import { QueryFactoryMixin } from './factoryMixins/QueryFactory.js';
import { SolutionModifiersFactoryMixin } from './factoryMixins/SolutionModifiersFactory.js';
import { TermFactoryMixin } from './factoryMixins/TermFactory.js';
import { UpdateOperationFactoryMixin } from './factoryMixins/UpdateOperationFactory.js';
import type {
  DatasetClauses,
  GraphNode,
  GraphQuads,
  PatternBgp,
  Sparql11Nodes,
  Term,
  TermBlank,
  TermIri,
  TermVariable,
  TripleCollectionBlankNodeProperties,
  TripleCollectionList,
  TripleNesting,
  Update,
  Wildcard,
} from './Sparql11types.js';

/**
 * A factory that helps you create, and check types for AST nodes for SPARQL 1.1
 */
export class AstFactory extends asArg(AstCoreFactory)
  .call(ContextFactoryMixin)
  .call(ExpressionFactoryMixin)
  .call(GraphRefFactoryMixin)
  .call(PathFactoryMixin)
  .call(PatternFactoryMixin)
  .call(QueryFactoryMixin)
  .call(SolutionModifiersFactoryMixin)
  .call(TermFactoryMixin)
  .call(UpdateOperationFactoryMixin)
  .returns() {
  public alwaysSparql11(obj: object): obj is Sparql11Nodes {
    return true;
  }

  public isPath(obj: object): obj is SubTyped<'term', 'namedNode'> | Typed<'path'> {
    return this.isPathPure(obj) || this.isTermNamed(obj);
  }

  public isExpression(obj: object):
    obj is SubTyped<'term', 'namedNode' | 'variable' | 'literal'> | Typed<'expression'> {
    return this.isExpressionPure(obj) || this.isTermNamed(obj) || this.isTermVariable(obj) || this.isTermLiteral(obj);
  }

  public graphNodeIdentifier(graphNode: GraphNode): Term {
    return graphNode.type === 'tripleCollection' ? graphNode.identifier : graphNode;
  }

  public triple(
    subject: TripleNesting['subject'],
    predicate: TripleNesting['predicate'],
    object: TripleNesting['object'],
    loc?: SourceLocation,
  ): TripleNesting {
    return {
      type: 'triple',
      subject,
      predicate,
      object,
      loc: loc ?? this.sourceLocation(subject, predicate, object),
    };
  }

  public isTriple(obj: object): obj is Typed<'triple'> {
    return this.isOfType(obj, 'triple');
  }

  public datasetClauses(clauses: DatasetClauses['clauses'], loc: SourceLocation): DatasetClauses {
    return {
      type: 'datasetClauses',
      clauses,
      loc,
    };
  }

  public isDatasetClauses(obj: object): obj is Typed<'datasetClauses'> {
    return this.isOfType(obj, 'datasetClauses');
  }

  public wildcard(loc: SourceLocation): Wildcard {
    return { type: 'wildcard', loc };
  }

  public isWildcard(obj: object): obj is Typed<'wildcard'> {
    return this.isOfType(obj, 'wildcard');
  }

  public isTripleCollection(obj: object): obj is Typed<'tripleCollection'> {
    return this.isOfType(obj, 'tripleCollection');
  }

  public tripleCollectionBlankNodeProperties(
    identifier: TermBlank,
    triples: TripleNesting[],
    loc: SourceLocation,
  ): TripleCollectionBlankNodeProperties {
    return {
      type: 'tripleCollection',
      subType: 'blankNodeProperties',
      identifier,
      triples,
      loc,
    };
  }

  public isTripleCollectionBlankNodeProperties(obj: object):
    obj is SubTyped<'tripleCollection', 'blankNodeProperties'> {
    return this.isOfSubType(obj, 'tripleCollection', 'blankNodeProperties');
  }

  public tripleCollectionList(
    identifier: TermBlank,
    triples: TripleNesting[],
    loc: SourceLocation,
  ): TripleCollectionList {
    return {
      type: 'tripleCollection',
      subType: 'list',
      identifier,
      triples,
      loc,
    };
  }

  public isTripleCollectionList(obj: object):
    obj is SubTyped<'tripleCollection', 'list'> {
    return this.isOfSubType(obj, 'tripleCollection', 'list');
  }

  public graphQuads(graph: TermIri | TermVariable, triples: PatternBgp, loc: SourceLocation): GraphQuads {
    return {
      type: 'graph',
      graph,
      triples,
      loc,
    };
  }

  public isGraphQuads(obj: object): obj is GraphQuads {
    return super.isOfType(obj, 'graph');
  }

  public isUpdate(obj: object): obj is Update {
    return super.isOfType(obj, 'update');
  }
}
