import type * as RDF from '@rdfjs/types';
import {
  findPatternBoundedVars,
} from '@traqula/rules-sparql-1-1';
import type {
  ContextDefinition,
  DatasetClauses,
  Path,
  PatternValues,
  SparqlQuery,
  Term,
  TripleCollection,
  TripleNesting,
  TermIri,
  TermBlank,
  TermLiteral,
  TermVariable,
} from '@traqula/rules-sparql-1-1';
import * as Algebra from '../algebra.js';
import * as util from '../util.js';
import type { AlgebraIndir } from './core.js';

export const translateNamed: AlgebraIndir<'translateNamed', RDF.NamedNode, [TermIri]> = {
  name: 'translateNamed',
  fun: () => ({ astFactory: F, currentPrefixes, currentBase, dataFactory }, term) => {
    let fullIri: string = term.value;
    if (F.isTermNamedPrefixed(term)) {
      const expanded = currentPrefixes[term.prefix];
      if (!expanded) {
        throw new Error(`Unknown prefix: ${term.prefix}`);
      }
      fullIri = expanded + term.value;
    }
    return dataFactory.namedNode(util.resolveIRI(fullIri, currentBase));
  },
};

export type AstToRdfTerm<T extends Term> = T extends TermVariable ? RDF.Variable :
  T extends TermBlank ? RDF.BlankNode :
    T extends TermLiteral ? RDF.Literal :
      T extends TermIri ? RDF.NamedNode : never;

export const translateTerm: AlgebraIndir<'translateTerm', RDF.Term, [Term]> = {
  name: 'translateTerm',
  fun: ({ SUBRULE }) => ({ astFactory: F, dataFactory }, term) => {
    if (F.isTermNamed(term)) {
      return SUBRULE(translateNamed, term);
    }
    if (F.isTermBlank(term)) {
      return dataFactory.blankNode(term.label);
    }
    if (F.isTermVariable(term)) {
      return dataFactory.variable(term.value);
    }
    if (F.isTermLiteral(term)) {
      const langOrIri = typeof term.langOrIri === 'object' ?
        SUBRULE(translateNamed, term.langOrIri) :
        term.langOrIri;
      return dataFactory.literal(term.value, langOrIri);
    }
    throw new Error(`Unexpected term: ${JSON.stringify(term)}`);
  },
};

export const registerContextDefinitions: AlgebraIndir<'registerContextDefinitions', void, [ContextDefinition[]]> = {
  name: 'registerContextDefinitions',
  fun: ({ SUBRULE }) => (c, definitions) => {
    const { astFactory: F, currentPrefixes } = c;
    for (const def of definitions) {
      if (F.isContextDefinitionPrefix(def)) {
        currentPrefixes[def.key] = SUBRULE(translateTerm, def.value).value;
      }
      if (F.isContextDefinitionBase(def)) {
        c.currentBase = SUBRULE(translateTerm, def.value).value;
      }
    }
  },
};

export const translateInlineData: AlgebraIndir<'translateInlineData', Algebra.Values, [PatternValues]> = {
  name: 'translateInlineData',
  fun: ({ SUBRULE }) => ({ algebraFactory: AF }, values) => {
    const variables = values.variables.map(x => <AstToRdfTerm<typeof x>> SUBRULE(translateTerm, x));
    const bindings = values.values.map((binding) => {
      const map: Record<string, RDF.NamedNode | RDF.Literal> = {};
      for (const [ key, value ] of Object.entries(binding)) {
        if (value !== undefined) {
          map[key] = <RDF.NamedNode | RDF.Literal> SUBRULE(translateTerm, value);
        }
      }
      return map;
    });
    return AF.createValues(variables, bindings);
  },
};

export const translateDatasetClause:
AlgebraIndir<'translateDatasetClause', { default: RDF.NamedNode[]; named: RDF.NamedNode[] }, [DatasetClauses]> = {
  name: 'translateDatasetClause',
  fun: ({ SUBRULE }) => (_, dataset) => ({
    default: dataset.clauses.filter(x => x.clauseType === 'default')
      .map(x => SUBRULE(translateNamed, x.value)),
    named: dataset.clauses.filter(x => x.clauseType === 'named')
      .map(x => SUBRULE(translateNamed, x.value)),
  }),
};

export const translateBlankNodesToVariables:
AlgebraIndir<'translateBlankNodesToVariables', Algebra.Operation, [Algebra.Operation]> = {
  name: 'translateBlankNodesToVariables',
  fun: ({ SUBRULE }) => ({ algebraFactory: AF, variables }, res) => {
    const blankToVariableMapping: Record<string, RDF.Variable> = {};
    const variablesRaw: Set<string> = new Set(variables);

    function uniqueVar(label: string): RDF.Variable {
      let counter = 0;
      let labelLoop = label;
      while (variables.has(labelLoop)) {
        labelLoop = `${label}${counter++}`;
      }
      return AF.dataFactory.variable!(labelLoop);
    };

    function blankToVariable(term: RDF.Term): RDF.Term {
      if (term.termType === 'BlankNode') {
        let variable = blankToVariableMapping[term.value];
        if (!variable) {
          variable = uniqueVar(term.value);
          variablesRaw.add(variable.value);
          blankToVariableMapping[term.value] = variable;
        }
        return variable;
      }
      if (term.termType === 'Quad') {
        return AF.dataFactory.quad(
          blankToVariable(term.subject),
          blankToVariable(term.predicate),
          blankToVariable(term.object),
          blankToVariable(term.graph),
        );
      }
      return term;
    }

    return util.mapOperation<'unsafe', typeof res>(res, {
      [Algebra.Types.PATH]: {
        preVisitor: () => ({ continue: false }),
        transform: pathOp => AF.createPath(
          blankToVariable(pathOp.subject),
          pathOp.predicate,
          blankToVariable(pathOp.object),
          blankToVariable(pathOp.graph),
        ),
      },
      [Algebra.Types.PATTERN]: {
        preVisitor: () => ({ continue: false }),
        transform: patternOp => AF.createPattern(
          blankToVariable(patternOp.subject),
          blankToVariable(patternOp.predicate),
          blankToVariable(patternOp.object),
          blankToVariable(patternOp.graph),
        ),
      },
      [Algebra.Types.CONSTRUCT]: {
        preVisitor: () => ({ continue: false }),
        // Blank nodes in CONSTRUCT templates must be maintained
        transform: constructOp =>
          AF.createConstruct(SUBRULE(translateBlankNodesToVariables, constructOp.input), constructOp.template),
      },
      [Algebra.Types.DELETE_INSERT]: {
        preVisitor: () => ({ continue: false }),
        transform: delInsOp =>
          // Make sure blank nodes remain in the INSERT block, but do update the WHERE block
          AF.createDeleteInsert(
            delInsOp.delete,
            delInsOp.insert,
            delInsOp.where && SUBRULE(translateBlankNodesToVariables, delInsOp.where),
          )
        ,
      },
    });
  },
};

/**
 * Will be used to make sure new variables don't overlap
 */
export const findAllVariables: AlgebraIndir<'findAllVariables', void, [object]> = {
  name: 'findAllVariables',
  fun: () => ({ transformer, variables }, thingy) => {
    transformer.visitNodeSpecific(thingy, {}, { term: { variable: { visitor: (_var) => {
      variables.add(_var.value);
    } }}});
  },
};

/**
 * 18.2.1
 */
export const inScopeVariables:
AlgebraIndir<'inScopeVariables', Set<string>, [SparqlQuery | TripleNesting | TripleCollection | Path | Term]> = {
  name: 'inScopeVariables',
  fun: () => (_, thingy) => {
    const vars = new Set<string>();
    findPatternBoundedVars(thingy, vars);
    return vars;
  },
};

export const generateFreshVar: AlgebraIndir<'generateFreshVar', RDF.Variable, []> = {
  name: 'generateFreshVar',
  fun: () => (c) => {
    let newVar = `var${c.varCount++}`;
    while (c.variables.has(newVar)) {
      newVar = `var${c.varCount++}`;
    }
    c.variables.add(newVar);
    return c.dataFactory.variable(newVar);
  },
};
