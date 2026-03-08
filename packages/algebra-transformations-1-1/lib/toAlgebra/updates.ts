import type * as RDF from '@rdfjs/types';
import type {
  GraphQuads,
  GraphRef,
  GraphRefDefault,
  GraphRefSpecific,
  PatternBgp,
  Update,
  UpdateOperation,
  UpdateOperationDeleteData,
  UpdateOperationDeleteWhere,
  UpdateOperationInsertData,
  UpdateOperationLoad,
  UpdateOperationModify,
} from '@traqula/rules-sparql-1-1';
import type { Algebra } from '../index.js';
import type { AlgebraIndir, FlattenedTriple } from './core.js';
import { registerContextDefinitions, translateDatasetClause, translateNamed, translateTerm } from './general.js';
import { translateGraphPattern } from './patterns.js';
import { recurseGraph, translateBasicGraphPattern, translateQuad } from './tripleAndQuad.js';

export const translateUpdate: AlgebraIndir<'translateUpdate', Algebra.Operation, [Update]> = {
  name: 'translateUpdate',
  fun: ({ SUBRULE }) => ({ algebraFactory: AF }, thingy) => {
    const updates: Algebra.Update[] = thingy.updates.flatMap((update) => {
      SUBRULE(registerContextDefinitions, update.context);
      return update.operation ? [ SUBRULE(translateSingleUpdate, update.operation) ] : [];
    });
    if (updates.length === 0) {
      return AF.createNop();
    }
    if (updates.length === 1) {
      return updates[0];
    }
    return AF.createCompositeUpdate(updates);
  },
};

export const translateSingleUpdate: AlgebraIndir<'translateSingleUpdate', Algebra.Update, [UpdateOperation]> = {
  name: 'translateSingleUpdate',
  fun: ({ SUBRULE }) => ({ astFactory: F, algebraFactory: AF }, op) => {
    if (F.isUpdateOperationLoad(op)) {
      return SUBRULE(translateUpdateGraphLoad, op);
    }
    if (F.isUpdateOperationClear(op)) {
      return AF.createClear(SUBRULE(translateGraphRef, op.destination), op.silent);
    }
    if (F.isUpdateOperationCreate(op)) {
      return AF.createCreate(<RDF.NamedNode> SUBRULE(translateGraphRef, op.destination), op.silent);
    }
    if (F.isUpdateOperationDrop(op)) {
      return AF.createDrop(SUBRULE(translateGraphRef, op.destination), op.silent);
    }
    if (F.isUpdateOperationAdd(op)) {
      return AF.createAdd(
        SUBRULE(translateGraphRefDefSpec, op.source),
        SUBRULE(translateGraphRefDefSpec, op.destination),
        op.silent,
      );
    }
    if (F.isUpdateOperationCopy(op)) {
      return AF.createCopy(
        SUBRULE(translateGraphRefDefSpec, op.source),
        SUBRULE(translateGraphRefDefSpec, op.destination),
        op.silent,
      );
    }
    if (F.isUpdateOperationMove(op)) {
      return AF.createMove(
        SUBRULE(translateGraphRefDefSpec, op.source),
        SUBRULE(translateGraphRefDefSpec, op.destination),
        op.silent,
      );
    }
    if (F.isUpdateOperationInsertData(op) || F.isUpdateOperationDeleteData(op) || F.isUpdateOperationDeleteWhere(op) ||
      F.isUpdateOperationModify(op)) {
      return SUBRULE(translateInsertDelete, op);
    }

    throw new Error(`Unknown update type ${JSON.stringify(op)}`);
  },
};

export const translateInsertDelete:
AlgebraIndir<
  'translateInsertDelete',
Algebra.Update,
[UpdateOperationInsertData | UpdateOperationDeleteData | UpdateOperationDeleteWhere | UpdateOperationModify]
> = {
  name: 'translateInsertDelete',
  fun: ({ SUBRULE }) => ({ useQuads, algebraFactory: AF, astFactory: F }, op) => {
    if (!useQuads) {
      throw new Error('INSERT/DELETE operations are only supported with quads option enabled');
    }

    const deleteTriples: Algebra.Pattern[] = [];
    const insertTriples: Algebra.Pattern[] = [];
    let where: Algebra.Operation | undefined;
    if (F.isUpdateOperationDeleteData(op) || F.isUpdateOperationDeleteWhere(op)) {
      deleteTriples.push(...op.data.flatMap(quad => SUBRULE(translateUpdateTriplesBlock, quad, undefined)));
      if (F.isUpdateOperationDeleteWhere(op)) {
        where = AF.createBgp(deleteTriples);
      }
    } else if (F.isUpdateOperationInsertData(op)) {
      insertTriples.push(...op.data.flatMap(quad => SUBRULE(translateUpdateTriplesBlock, quad, undefined)));
    } else {
      deleteTriples.push(...op.delete.flatMap(quad =>
        SUBRULE(translateUpdateTriplesBlock, quad, op.graph ? SUBRULE(translateNamed, op.graph) : op.graph)));
      insertTriples.push(...op.insert.flatMap(quad =>
        SUBRULE(translateUpdateTriplesBlock, quad, op.graph ? SUBRULE(translateNamed, op.graph) : op.graph)));
      if (op.where.patterns.length > 0) {
        where = SUBRULE(translateGraphPattern, op.where);
        const use: { default: RDF.NamedNode[]; named: RDF.NamedNode[] } = SUBRULE(translateDatasetClause, op.from);
        if (use.default.length > 0 || use.named.length > 0) {
          where = AF.createFrom(where, use.default, use.named);
        } else if (F.isUpdateOperationModify(op) && op.graph) {
          // This is equivalent
          where = SUBRULE(recurseGraph, where, SUBRULE(translateNamed, op.graph), undefined);
        }
      }
    }

    return AF.createDeleteInsert(
      deleteTriples.length > 0 ? deleteTriples : undefined,
      insertTriples.length > 0 ? insertTriples : undefined,
      where,
    );
  },
};

// UPDATE parsing will always return quads and have no GRAPH elements
export const translateUpdateTriplesBlock:
AlgebraIndir<'translateUpdateTriplesBlock', Algebra.Pattern[], [PatternBgp | GraphQuads, RDF.NamedNode | undefined]> = {
  name: 'translateUpdateTriplesBlock',
  fun: ({ SUBRULE }) => (c, thingy, graph) => {
    const F = c.astFactory;
    let currentGraph: RDF.NamedNode | RDF.Variable | undefined = graph;
    let patternBgp: PatternBgp;
    if (F.isGraphQuads(thingy)) {
      currentGraph = <RDF.NamedNode | RDF.Variable> SUBRULE(translateTerm, thingy.graph);
      patternBgp = thingy.triples;
    } else {
      patternBgp = thingy;
    }
    let triples: FlattenedTriple[] = [];
    SUBRULE(translateBasicGraphPattern, patternBgp.triples, triples);
    if (currentGraph) {
      triples = triples.map(triple => Object.assign(triple, { graph: currentGraph }));
    }
    return triples.map(triple => SUBRULE(translateQuad, triple));
  },
};

export const translateGraphRefSpecific: AlgebraIndir<'translateGraphRefSpecific', RDF.NamedNode, [GraphRefSpecific]> = {
  name: 'translateGraphRefSpecific',
  fun: ({ SUBRULE }) => (_, graph) => SUBRULE(translateNamed, graph.graph),
};

export const translateGraphRefDefSpec:
AlgebraIndir<'translateGraphRefDefSpec', RDF.NamedNode | 'DEFAULT', [GraphRefSpecific | GraphRefDefault]> = {
  name: 'translateGraphRefDefSpec',
  fun: ({ SUBRULE }) => ({ astFactory: F }, graph) =>
    F.isGraphRefDefault(graph) ? 'DEFAULT' : SUBRULE(translateGraphRefSpecific, graph),
};

export const translateGraphRef:
AlgebraIndir<'translateGraphRef', 'DEFAULT' | 'NAMED' | 'ALL' | RDF.NamedNode, [GraphRef]> = {
  name: 'translateGraphRef',
  fun: ({ SUBRULE }) => (c, graph) => {
    const F = c.astFactory;
    if (F.isGraphRefAll(graph)) {
      return 'ALL';
    }
    if (F.isGraphRefNamed(graph)) {
      return 'NAMED';
    }
    return SUBRULE(translateGraphRefDefSpec, graph);
  },
};

export const translateUpdateGraphLoad: AlgebraIndir<'translateUpdateGraphLoad', Algebra.Load, [UpdateOperationLoad]> = {
  name: 'translateUpdateGraphLoad',
  fun: ({ SUBRULE }) => ({ algebraFactory: AF }, op) => AF.createLoad(
    SUBRULE(translateNamed, op.source),
    op.destination ? SUBRULE(translateNamed, op.destination.graph) : undefined,
    op.silent,
  ),
};
