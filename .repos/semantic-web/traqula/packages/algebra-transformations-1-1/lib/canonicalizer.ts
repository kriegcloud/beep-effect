import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import * as Algebra from './algebra.js';
import * as util from './util.js';
import { AlgebraFactory } from './index.js';

export class Canonicalizer {
  public constructor() {
    this.blankId = 0;
  }

  public blankId: number;
  public genValue(): string {
    return `value_${this.blankId++}`;
  }

  /**
   * Replaces values of BlankNodes in a query with newly generated names.
   * @param res
   * @param replaceVariables
   */
  public canonicalizeQuery(res: Algebra.Operation, replaceVariables: boolean): Algebra.Operation {
    this.blankId = 0;
    const nameMapping: Record<string, string> = {};
    const factory = new AlgebraFactory();

    return util.mapOperation<'unsafe', typeof res>(res, {
      [Algebra.Types.PATH]: { transform: pathOp => ({
        result: factory.createPath(
          this.replaceValue(pathOp.subject, nameMapping, replaceVariables, factory),
          pathOp.predicate,
          this.replaceValue(pathOp.object, nameMapping, replaceVariables, factory),
          this.replaceValue(pathOp.graph, nameMapping, replaceVariables, factory),
        ),
        recurse: true,
      }) },
      [Algebra.Types.PATTERN]: { transform: patternOp => ({
        result: factory.createPattern(
          this.replaceValue(patternOp.subject, nameMapping, replaceVariables, factory),
          this.replaceValue(patternOp.predicate, nameMapping, replaceVariables, factory),
          this.replaceValue(patternOp.object, nameMapping, replaceVariables, factory),
          this.replaceValue(patternOp.graph, nameMapping, replaceVariables, factory),
        ),
        recurse: true,
      }) },
      [Algebra.Types.CONSTRUCT]: { transform: constructOp =>
        // Blank nodes in CONSTRUCT templates must be maintained
        ({
          result: factory.createConstruct(constructOp.input, constructOp.template),
          recurse: true,
        }) },
    });
  }

  public replaceValue(
    term: RDF.Term,
    nameMapping: Record<string, string>,
    replaceVars: boolean,
    factory: AlgebraFactory,
  ): RDF.Term {
    if (term.termType === 'Quad') {
      return factory.createPattern(
        this.replaceValue(term.subject, nameMapping, replaceVars, factory),
        this.replaceValue(term.predicate, nameMapping, replaceVars, factory),
        this.replaceValue(term.object, nameMapping, replaceVars, factory),
        this.replaceValue(term.graph, nameMapping, replaceVars, factory),
      );
    }

    if (term.termType !== 'BlankNode' && (term.termType !== 'Variable' || !replaceVars)) {
      return term;
    }

    const dataFactory = new DataFactory();
    const generateTerm = term.termType === 'Variable' ?
      dataFactory.variable.bind(dataFactory) :
      dataFactory.blankNode.bind(dataFactory);

    let val = nameMapping[term.value];
    if (!val) {
      val = this.genValue();
      nameMapping[term.value] = val;
    }
    return generateTerm(val);
  }
}
