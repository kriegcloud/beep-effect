/**
 * This module will define patch rules that should be used in combination with the sparql11 grammar to create
 * a sparql12 grammar.
 * Rules in this module redefine the return type of core grammar rules.
 * It is therefore essential that the parser retypes the rules from the core grammar.
 */
import type { RuleDefReturn, Wrap } from '@traqula/core';
import { traqulaIndentation } from '@traqula/core';
import { CommonIRIs, funcExpr1, funcExpr3, gram as S11, lex as l11 } from '@traqula/rules-sparql-1-1';
import type * as T11 from '@traqula/rules-sparql-1-1';
import * as l12 from './lexer.js';
import type { SparqlGeneratorRule, SparqlGrammarRule, SparqlRule } from './sparql12HelperTypes.js';
import type {
  Annotation,
  ContextDefinition,
  ContextDefinitionVersion,
  Expression,
  GraphNode,
  GraphTerm,
  PatternBgp,
  Term,
  TermBlank,
  TermIri,
  TermLiteral,
  TermTriple,
  TermVariable,
  TripleCollectionBlankNodeProperties,
  TripleCollectionReifiedTriple,
  TripleNesting,
} from './sparql12Types.js';
import { langTagHasCorrectRange } from './validators.js';

/**
 *[[7]](https://www.w3.org/TR/sparql12-query/#rVersionDecl)
 */
export const versionDecl: SparqlRule<'versionDecl', ContextDefinitionVersion> = {
  name: 'versionDecl',
  impl: ({ ACTION, SUBRULE, CONSUME }) => (C) => {
    const versionToken = CONSUME(l12.version);
    const identifier = SUBRULE(versionSpecifier);
    return ACTION(() =>
      C.astFactory.contextDefinitionVersion(identifier.val, C.astFactory.sourceLocation(versionToken, identifier)));
  },
  gImpl: ({ PRINT_ON_OWN_LINE }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => {
      PRINT_ON_OWN_LINE('VERSION ', `${S11.stringEscapedLexical(ast.version)}`);
    });
  },
};

/**
 * [[8]](https://www.w3.org/TR/sparql12-query/#rVersionSpecifier)
 */
export const versionSpecifier: SparqlGrammarRule<'versionSpecifier', Wrap<string>> = {
  name: 'versionSpecifier',
  impl: ({ ACTION, CONSUME, OR }) => (C) => {
    const token = OR([
      { ALT: () => CONSUME(l11.terminals.stringLiteral1) },
      { ALT: () => CONSUME(l11.terminals.stringLiteral2) },
    ]);
    return ACTION(() => C.astFactory.wrap(token.image.slice(1, -1), C.astFactory.sourceLocation(token)));
  },
};

/**
 * OVERRIDING RULE {@link S11.prologue}
 * [[4]](https://www.w3.org/TR/sparql12-query/#rPrologue)
 */
export const prologue: SparqlRule<'prologue', ContextDefinition[]> = {
  name: 'prologue',
  impl: ({ SUBRULE, MANY, OR }) => () => {
    const result: ContextDefinition[] = [];
    MANY(() => OR([
      { ALT: () => result.push(SUBRULE(S11.baseDecl)) },
      // TODO: the [spec](https://www.w3.org/TR/sparql11-query/#iriRefs) says you cannot redefine prefixes.
      //  We might need to check this.
      { ALT: () => result.push(SUBRULE(S11.prefixDecl)) },
      { ALT: () => result.push(SUBRULE(versionDecl)) },
    ]));
    return result;
  },
  gImpl: ({ SUBRULE }) => (ast, { astFactory: F }) => {
    for (const context of ast) {
      if (F.isContextDefinitionBase(context)) {
        SUBRULE(S11.baseDecl, context);
      } else if (F.isContextDefinitionPrefix(context)) {
        SUBRULE(S11.prefixDecl, context);
      } else if (F.isContextDefinitionVersion(context)) {
        SUBRULE(versionDecl, context);
      }
    }
  },
};

function reifiedTripleBlockImpl<T extends string>(name: T, allowPath: boolean):
SparqlGrammarRule<T, T11.BasicGraphPattern> {
  return <const> {
    name,
    impl: ({ ACTION, SUBRULE }) => (C) => {
      const triple = SUBRULE(reifiedTriple);
      const properties = SUBRULE(
        allowPath ? S11.propertyListPath : S11.propertyList,
        ACTION(() => C.astFactory.dematerialized(triple.identifier)),
      );

      return ACTION(() => <T11.BasicGraphPattern> [ triple, ...properties ]);
    },
  };
}
/**
 * [[58]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleBlock) Used by triplesSameSubject
 */
export const reifiedTripleBlock = reifiedTripleBlockImpl('reifiedTripleBlock', false);
/**
 * [[59]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleBlockPath) Used by TriplesSameSubjectPath
 */
export const reifiedTripleBlockPath = reifiedTripleBlockImpl('reifiedTripleBlockPath', true);

/**
 * OVERRIDING RULE: {@link S11.dataBlockValue}.
 * [[69]](https://www.w3.org/TR/sparql12-query/#rDataBlockValue)
 */
export const dataBlockValue:
SparqlGrammarRule<'dataBlockValue', RuleDefReturn<typeof S11.dataBlockValue> | TermTriple> = <const> {
  name: 'dataBlockValue',
  impl: $ => C => $.OR2<RuleDefReturn<typeof dataBlockValue>>([
    { ALT: () => S11.dataBlockValue.impl($)(C) },
    { ALT: () => $.SUBRULE(tripleTermData) },
  ]),
};

/**
 * [[70]](https://www.w3.org/TR/sparql12-query/#rReifier)
 */
export const reifier: SparqlGrammarRule<'reifier', Wrap<RuleDefReturn<typeof varOrReifierId>>> = <const> {
  name: 'reifier',
  impl: ({ ACTION, CONSUME, SUBRULE, OPTION }) => (C) => {
    const tildeToken = CONSUME(l12.tilde);
    const reifier = OPTION(() => SUBRULE(varOrReifierId));
    return ACTION(() => {
      if (reifier === undefined && !C.parseMode.has('canCreateBlankNodes')) {
        throw new Error('Cannot create blanknodes in current parse mode');
      }
      return C.astFactory.wrap(
        reifier ?? C.astFactory.termBlank(undefined, C.astFactory.sourceLocation()),
        C.astFactory.sourceLocation(tildeToken, reifier),
      );
    });
  },
};

/**
 * [[71]](https://www.w3.org/TR/sparql12-query/#rVarOrReifierId)
 */
export const varOrReifierId: SparqlGrammarRule<'varOrReifierId', TermVariable | TermIri | TermBlank> =
  <const> {
    name: 'varOrReifierId',
    impl: ({ SUBRULE, OR }) => C => OR<RuleDefReturn<typeof varOrReifierId>>([
      { GATE: () => C.parseMode.has('canParseVars'), ALT: () => SUBRULE(S11.var_) },
      { ALT: () => SUBRULE(S11.iri) },
      { ALT: () => SUBRULE(S11.blankNode) },
    ]),
  };

function triplesSameSubjectImpl<T extends string>(name: T, allowPaths: boolean):
SparqlGrammarRule<T, T11.BasicGraphPattern> {
  return <const> {
    name,
    impl: $ => C => $.OR2([
      { ALT: () => allowPaths ?
        S11.triplesSameSubjectPath.impl($)(C) :
        S11.triplesSameSubject.impl($)(C) },
      { ALT: () => $.SUBRULE(allowPaths ? reifiedTripleBlockPath : reifiedTripleBlock) },
    ]),
  };
}
/**
 * OVERRIDING RULE {@link S11.triplesSameSubject}
 * [[81]](https://www.w3.org/TR/sparql12-query/#rTriplesSameSubject)
 */
export const triplesSameSubject = triplesSameSubjectImpl('triplesSameSubject', false);
/**
 * OVERRIDING RULE {@link S11.triplesSameSubjectPath}
 * [[87]](https://www.w3.org/TR/sparql12-query/#rTriplesSameSubjectPath)
 */
export const triplesSameSubjectPath = triplesSameSubjectImpl('triplesSameSubjectPath', true);

function objectImpl<T extends string>(name: T, allowPaths: boolean):
SparqlGrammarRule<T, TripleNesting, [TripleNesting['subject'], TripleNesting['predicate']]> {
  return <const>{
    name,
    impl: ({ ACTION, SUBRULE }) => (C, subject, predicate) => {
      const objectVal = SUBRULE(allowPaths ? graphNodePath : graphNode);
      const annotationVal = SUBRULE(allowPaths ? annotationPath : annotation);

      return ACTION(() => {
        const F = C.astFactory;
        if (F.isPathPure(predicate) && annotationVal.length > 0) {
          throw new Error('Note 17 violation');
        }
        return F.annotatedTriple(
          subject,
          predicate,
          objectVal,
          annotationVal,
        );
      });
    },
  };
}
/**
 * OVERRIDING RULE: {@link S11.object}.
 * [[86]](https://www.w3.org/TR/sparql12-query/#rObject) Used by ObjectList
 */
export const object = objectImpl('object', false);
/**
 * OVERRIDING RULE: {@link S11.objectPath}.
 * [[87]](https://www.w3.org/TR/sparql12-query/#rTriplesSameSubjectPath) Used by ObjectListPath
 */
export const objectPath = objectImpl('objectPath', true);

function annotationImpl<T extends string>(name: T, allowPaths: boolean): SparqlRule<T, Annotation[]> {
  return <const> {
    name,
    impl: ({ ACTION, SUBRULE, OR, MANY }) => (C) => {
      const annotations: Annotation[] = [];
      let currentReifier: TermBlank | TermVariable | TermIri | undefined;

      MANY(() => {
        OR([
          { ALT: () => {
            const node = SUBRULE(reifier);
            annotations.push(node);
            currentReifier = node.val;
          } },
          { ALT: () => {
            ACTION(() => {
              if (!currentReifier && !C.parseMode.has('canCreateBlankNodes')) {
                throw new Error('Cannot create blanknodes in current parse mode');
              }
              currentReifier = currentReifier ?? C.astFactory.termBlank(undefined, C.astFactory.sourceLocation());
            });
            const block = SUBRULE(
              allowPaths ? annotationBlockPath : annotationBlock,
              currentReifier!,
            );
            ACTION(() => {
              annotations.push(block);
              currentReifier = undefined;
            });
          } },
        ]);
      });
      return annotations;
    },
    gImpl: ({ SUBRULE, PRINT_WORD }) => (ast, { astFactory: F }) => {
      for (const annotation of ast) {
        if (F.isTripleCollectionBlankNodeProperties(annotation)) {
          SUBRULE(annotationBlockPath, annotation);
        } else {
          F.printFilter(annotation, () => PRINT_WORD('~'));
          SUBRULE(graphNodePath, annotation.val);
        }
      }
    },
  };
}
/**
 * [[109]](https://www.w3.org/TR/sparql12-query/#rAnnotationPath)
 */
export const annotationPath = annotationImpl('annotationPath', true);
/**
 * [[111]](https://www.w3.org/TR/sparql12-query/#rAnnotation)
 */
export const annotation = annotationImpl('annotation', false);

function annotationBlockImpl<T extends string>(name: T, allowPaths: boolean):
  SparqlGrammarRule<T, TripleCollectionBlankNodeProperties, [TripleCollectionBlankNodeProperties['identifier']]> &
  SparqlGeneratorRule<T, TripleCollectionBlankNodeProperties> {
  return <const> {
    name,
    impl: ({ ACTION, SUBRULE, CONSUME }) => (C, arg) => {
      const open = CONSUME(l12.annotationOpen);
      const res = SUBRULE(
        allowPaths ? S11.propertyListPathNotEmpty : S11.propertyListNotEmpty,
        arg,
      );
      const close = CONSUME(l12.annotationClose);

      return ACTION(() => C.astFactory.tripleCollectionBlankNodeProperties(
        arg,
        res,
        C.astFactory.sourceLocation(open, close),
      ));
    },
    gImpl: ({ SUBRULE, PRINT_WORD, HANDLE_LOC, NEW_LINE, PRINT_ON_OWN_LINE }) => (ast, C) => {
      const { astFactory: F, indentInc } = C;
      F.printFilter(ast, () => {
        PRINT_WORD('{|');
        if (ast.triples.length > 1) {
          C[traqulaIndentation] += indentInc;
          NEW_LINE();
        }
      });

      function printTriple(triple: TripleNesting): void {
        HANDLE_LOC(triple, () => {
          if (F.isTerm(triple.predicate)) {
            SUBRULE(graphNodePath, triple.predicate);
          } else {
            SUBRULE(S11.pathGenerator, triple.predicate, undefined);
          }
          F.printFilter(triple, () => PRINT_WORD(''));
          SUBRULE(graphNodePath, triple.object);
        });
      }

      const [ head, ...tail ] = ast.triples;
      printTriple(head);
      for (const triple of tail) {
        F.printFilter(ast, () => {
          PRINT_WORD(';');
          NEW_LINE();
        });
        printTriple(triple);
      }

      F.printFilter(ast, () => {
        if (ast.triples.length > 1) {
          PRINT_ON_OWN_LINE('|}');
        } else {
          PRINT_WORD('|}');
        }
      });
    },
  };
}
/**
 * [[110]](https://www.w3.org/TR/sparql12-query/#rAnnotationBlockPath)
 */
export const annotationBlockPath = annotationBlockImpl('annotationBlockPath', true);
/**
 * [[112]](https://www.w3.org/TR/sparql12-query/#rAnnotationBlock)
 */
export const annotationBlock = annotationBlockImpl('annotationBlock', false);

/**
 * OVERRIDING RULE: {@link S11.graphNode}.
 * [[113]](https://www.w3.org/TR/sparql12-query/#rGraphNode)
 */
export const graphNode: SparqlGrammarRule<'graphNode', GraphNode> = <const> {
  name: 'graphNode',
  impl: $ => C => $.OR2<RuleDefReturn<typeof graphNode>>([
    { ALT: () => S11.graphNode.impl($)(C) },
    { ALT: () => $.SUBRULE(reifiedTriple) },
  ]),
};
/**
 * OVERRIDING RULE: {@link S11.graphNodePath}.
 * [[114]](https://www.w3.org/TR/sparql12-query/#rGraphNodePath)
 */
export const graphNodePath: SparqlRule<'graphNodePath', GraphNode> = <const> {
  name: 'graphNodePath',
  impl: $ => C => $.OR2<RuleDefReturn<typeof graphNodePath>>([
    { ALT: () => S11.graphNodePath.impl($)(C) },
    { ALT: () => $.SUBRULE(reifiedTriple) },
  ]),
  gImpl: $ => (ast, C) => {
    if (C.astFactory.isTripleCollectionReifiedTriple(ast)) {
      $.SUBRULE(reifiedTriple, ast);
    } else {
      S11.graphNodePath.gImpl($)(<T11.Term | T11.TripleCollection> ast, C);
    }
  },
};

/**
 * OVERRIDING RULE: {@link S11.varOrTerm}.
 * [[115]](https://www.w3.org/TR/sparql12-query/#rVarOrTerm)
 */
export const varOrTerm: SparqlGrammarRule<'varOrTerm', Term> = <const> {
  name: 'varOrTerm',
  impl: ({ ACTION, SUBRULE, OR, CONSUME }) => C => OR<Term>([
    { GATE: () => C.parseMode.has('canParseVars'), ALT: () => SUBRULE(S11.var_) },
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(S11.numericLiteral) },
    { ALT: () => SUBRULE(S11.booleanLiteral) },
    { ALT: () => SUBRULE(S11.blankNode) },
    { ALT: () => {
      const token = CONSUME(l11.terminals.nil);
      return ACTION(() => C.astFactory.termNamed(C.astFactory.sourceLocation(token), CommonIRIs.NIL));
    } },
    { ALT: () => SUBRULE(tripleTerm) },
  ]),
  // Generation remains untouched - go through graphTerm
};

/**
 * [[116]](https://www.w3.org/TR/sparql12-query/#rReifiedTriple)
 */
export const reifiedTriple: SparqlRule<'reifiedTriple', TripleCollectionReifiedTriple> = <const> {
  name: 'reifiedTriple',
  impl: ({ ACTION, CONSUME, SUBRULE, OPTION }) => (C) => {
    const open = CONSUME(l12.reificationOpen);
    const subject = SUBRULE(reifiedTripleSubject);
    const predicate = SUBRULE(S11.verb);
    const object = SUBRULE(reifiedTripleObject);
    const reifierVal = OPTION(() => SUBRULE(reifier));
    const close = CONSUME(l12.reificationClose);

    return ACTION(() => {
      // A reifier would be auto generated in this case, but we are not allowed to use them.
      if (reifierVal === undefined && !C.parseMode.has('canCreateBlankNodes')) {
        throw new Error('Cannot create blanknodes in current parse mode');
      }
      return C.astFactory.tripleCollectionReifiedTriple(
        C.astFactory.sourceLocation(open, close),
        subject,
        predicate,
        object,
        reifierVal?.val,
      );
    });
  },
  gImpl: ({ SUBRULE, PRINT_WORD }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => PRINT_WORD('<<'));
    const triple = ast.triples[0];
    SUBRULE(graphNodePath, triple.subject);

    F.printFilter(ast, () => PRINT_WORD(''));
    if (F.isPathPure(triple.predicate)) {
      SUBRULE(S11.pathGenerator, triple.predicate, undefined);
    } else {
      SUBRULE(graphNodePath, triple.predicate);
    }

    F.printFilter(ast, () => PRINT_WORD(''));
    SUBRULE(graphNodePath, triple.object);

    SUBRULE(annotationPath, [ F.wrap(ast.identifier, ast.identifier.loc) ]);
    F.printFilter(ast, () => PRINT_WORD('>>'));
  },
};

/**
 * [[117]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleSubject)
 */
export const reifiedTripleSubject:
SparqlGrammarRule<'reifiedTripleSubject', Term | TripleCollectionReifiedTriple> = <const> {
  name: 'reifiedTripleSubject',
  impl: ({ OR, SUBRULE }) => C => OR<RuleDefReturn<typeof reifiedTripleSubject>>([
    { GATE: () => C.parseMode.has('canParseVars'), ALT: () => SUBRULE(S11.var_) },
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(S11.numericLiteral) },
    { ALT: () => SUBRULE(S11.booleanLiteral) },
    { ALT: () => SUBRULE(S11.blankNode) },
    { ALT: () => SUBRULE(reifiedTriple) },
    { ALT: () => SUBRULE(tripleTerm) },
  ]),
};

/**
 * [[118]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleObject)
 */
export const reifiedTripleObject:
SparqlGrammarRule<'reifiedTripleObject', RuleDefReturn<typeof reifiedTripleSubject>> =
  <const> {
    name: 'reifiedTripleObject',
    impl: reifiedTripleSubject.impl,
  };

/**
 * [[119]](https://www.w3.org/TR/sparql12-query/#rTripleTerm)
 */
export const tripleTerm: SparqlRule<'tripleTerm', TermTriple> = <const> {
  name: 'tripleTerm',
  impl: ({ ACTION, CONSUME, SUBRULE }) => (C) => {
    const open = CONSUME(l12.tripleTermOpen);
    const subject = SUBRULE(tripleTermSubject);
    const predicate = SUBRULE(S11.verb);
    const object = SUBRULE(tripleTermObject);
    const close = CONSUME(l12.tripleTermClose);
    return ACTION(() => C.astFactory.termTriple(subject, predicate, object, C.astFactory.sourceLocation(open, close)));
  },
  gImpl: ({ SUBRULE, PRINT_WORD }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => PRINT_WORD('<<('));
    SUBRULE(graphNodePath, ast.subject);
    F.printFilter(ast, () => PRINT_WORD(''));
    SUBRULE(graphNodePath, ast.predicate);
    F.printFilter(ast, () => PRINT_WORD(''));
    SUBRULE(graphNodePath, ast.object);
    F.printFilter(ast, () => PRINT_WORD(')>>'));
  },
};

/**
 * [[120]](https://www.w3.org/TR/sparql12-query/#rTripleTermSubject)
 */
export const tripleTermSubject:
SparqlGrammarRule<'tripleTermSubject', TermVariable | TermIri | TermLiteral | TermBlank | TermTriple> = <const> {
  name: 'tripleTermSubject',
  impl: ({ SUBRULE, OR }) => C => OR<RuleDefReturn<typeof tripleTermSubject>>([
    { GATE: () => C.parseMode.has('canParseVars'), ALT: () => SUBRULE(S11.var_) },
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(S11.numericLiteral) },
    { ALT: () => SUBRULE(S11.booleanLiteral) },
    { ALT: () => SUBRULE(S11.blankNode) },
    { ALT: () => SUBRULE(tripleTerm) },
  ]),
};

/**
 * [[121]](https://www.w3.org/TR/sparql12-query/#rTripleTermObject)
 */
export const tripleTermObject:
SparqlGrammarRule<'tripleTermObject', RuleDefReturn<typeof tripleTermSubject>> = <const> {
  name: 'tripleTermObject',
  impl: tripleTermSubject.impl,
};

/**
 * [[122]](https://www.w3.org/TR/sparql12-query/#rTripleTermData)
 */
export const tripleTermData: SparqlGrammarRule<'tripleTermData', TermTriple> = <const> {
  name: 'tripleTermData',
  impl: ({ ACTION, CONSUME, OR, SUBRULE }) => (C) => {
    const open = CONSUME(l12.tripleTermOpen);
    const subject = SUBRULE(tripleTermDataSubject);
    const predicate = OR([
      { ALT: () => SUBRULE(S11.iri) },
      { ALT: () => {
        const token = CONSUME(l11.a);
        return ACTION(() => C.astFactory.termNamed(C.astFactory.sourceLocation(token), CommonIRIs.TYPE));
      } },
    ]);
    const object = SUBRULE(tripleTermDataObject);
    const close = CONSUME(l12.tripleTermClose);

    return ACTION(() => C.astFactory.termTriple(subject, predicate, object, C.astFactory.sourceLocation(open, close)));
  },
};

/**
 * [[123]](https://www.w3.org/TR/sparql12-query/#rTripleTermDataSubject)
 */
export const tripleTermDataSubject: SparqlGrammarRule<'tripleTermDataSubject', TermIri | TermLiteral | TermTriple> =
  <const> {
    name: 'tripleTermDataSubject',
    impl: ({ OR, SUBRULE }) => () => OR<RuleDefReturn<typeof tripleTermDataSubject>>([
      { ALT: () => SUBRULE(S11.iri) },
    ]),
  };

/**
 * [[124]](https://www.w3.org/TR/sparql12-query/#rTripleTermDataObject)
 */
export const tripleTermDataObject:
SparqlGrammarRule<'tripleTermDataObject', RuleDefReturn<typeof tripleTermDataSubject>> = <const> {
  name: 'tripleTermDataObject',
  impl: ({ OR, SUBRULE }) => () => OR<RuleDefReturn<typeof tripleTermDataSubject>>([
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(S11.numericLiteral) },
    { ALT: () => SUBRULE(S11.booleanLiteral) },
    { ALT: () => SUBRULE(tripleTermData) },
  ]),
};

/**
 * OVERRIDING RULE: {@link S11.primaryExpression}.
 * [[136]](https://www.w3.org/TR/sparql12-query/#rPrimaryExpression)
 */
export const primaryExpression: SparqlGrammarRule<'primaryExpression', Expression> = <const> {
  name: 'primaryExpression',
  impl: $ => C => $.OR2<Expression>([
    { ALT: () => S11.primaryExpression.impl($)(C) },
    { ALT: () => $.SUBRULE(exprTripleTerm) },
  ]),
};

/**
 * [[137]](https://www.w3.org/TR/sparql12-query/#rExprTripleTerm)
 */
export const exprTripleTerm: SparqlGrammarRule<'exprTripleTerm', TermTriple> = <const> {
  name: 'exprTripleTerm',
  impl: ({ ACTION, CONSUME, SUBRULE }) => (C) => {
    const open = CONSUME(l12.tripleTermOpen);
    const subject = SUBRULE(exprTripleTermSubject);
    const predicate = SUBRULE(S11.verb);
    const object = SUBRULE(exprTripleTermObject);
    const close = CONSUME(l12.tripleTermClose);

    return ACTION(() => C.astFactory.termTriple(
      subject,
      predicate,
      object,
      C.astFactory.sourceLocation(open, close),
    ));
  },
};

/**
 * [[138]](https://www.w3.org/TR/sparql12-query/#rExprTripleTermSubject)
 */
export const exprTripleTermSubject:
SparqlGrammarRule<'exprTripleTermSubject', TermIri | TermVariable | TermLiteral | TermTriple> = <const> {
  name: 'exprTripleTermSubject',
  impl: ({ OR, SUBRULE }) => C =>
    OR<RuleDefReturn<typeof exprTripleTermSubject>>([
      { ALT: () => SUBRULE(S11.iri) },
      { GATE: () => C.parseMode.has('canParseVars'), ALT: () => SUBRULE(S11.var_) },
    ]),
};

/**
 * [[139]](https://www.w3.org/TR/sparql12-query/#rExprTripleTermObject)
 */
export const exprTripleTermObject:
SparqlGrammarRule<'exprTripleTermObject', RuleDefReturn<typeof exprTripleTermSubject> | TermTriple> = <const> {
  name: 'exprTripleTermObject',
  impl: ({ OR, SUBRULE }) => C =>
    OR<RuleDefReturn<typeof exprTripleTermSubject>>([
      { ALT: () => SUBRULE(S11.iri) },
      { ALT: () => SUBRULE(rdfLiteral) },
      { ALT: () => SUBRULE(S11.numericLiteral) },
      { ALT: () => SUBRULE(S11.booleanLiteral) },
      { GATE: () => C.parseMode.has('canParseVars'), ALT: () => SUBRULE(S11.var_) },
      { ALT: () => SUBRULE(exprTripleTerm) },
    ]),
};

export const buildInLangDir = funcExpr1(l12.buildInLangDir);
export const buildInLangStrDir = funcExpr3(l12.buildInStrLangDir);
export const buildInHasLang = funcExpr1(l12.buildInHasLang);
export const buildInHasLangDir = funcExpr1(l12.buildInHasLangDir);
export const buildInIsTriple = funcExpr1(l12.buildInIsTRIPLE);
export const buildInTriple = funcExpr3(l12.buildInTRIPLE);
export const buildInSubject = funcExpr1(l12.buildInSUBJECT);
export const buildInPredicate = funcExpr1(l12.buildInPREDICATE);
export const buildInObject = funcExpr1(l12.buildInOBJECT);

/**
 * OVERRIDING RULE: {@link S11.builtInCall}.
 * [[141]](https://www.w3.org/TR/sparql12-query/#rBuiltInCall)
 */
export const builtInCall: typeof S11.builtInCall = <const> {
  name: 'builtInCall',
  impl: $ => C => $.OR2<T11.Expression>([
    { ALT: () => S11.builtInCall.impl($)(C) },
    { ALT: () => $.SUBRULE(buildInLangDir) },
    { ALT: () => $.SUBRULE(buildInLangStrDir) },
    { ALT: () => $.SUBRULE(buildInHasLang) },
    { ALT: () => $.SUBRULE(buildInHasLangDir) },
    { ALT: () => $.SUBRULE(buildInIsTriple) },
    { ALT: () => $.SUBRULE(buildInTriple) },
    { ALT: () => $.SUBRULE(buildInSubject) },
    { ALT: () => $.SUBRULE(buildInPredicate) },
    { ALT: () => $.SUBRULE(buildInObject) },
  ]),
};

/**
 * OVERRIDING RULE: {@link S11.rdfLiteral}.
 * No retyping is needed since the return type is the same
 * [[149]](https://www.w3.org/TR/sparql12-query/#rRDFLiteral)
 */
export const rdfLiteral: SparqlGrammarRule<'rdfLiteral', RuleDefReturn<typeof S11.rdfLiteral>> = <const> {
  name: 'rdfLiteral',
  impl: ({ ACTION, SUBRULE, OPTION, CONSUME, OR }) => (C) => {
    const value = SUBRULE(S11.string);
    return OPTION(() => OR<RuleDefReturn<typeof rdfLiteral>>([
      { ALT: () => {
        const langTag = CONSUME(l12.LANG_DIR);
        return ACTION(() => {
          const literal = C.astFactory.termLiteral(
            C.astFactory.sourceLocation(value, langTag),
            value.value,
            langTag.image.slice(1).toLowerCase(),
          );
          langTagHasCorrectRange(literal);
          return literal;
        });
      } },
      { ALT: () => {
        CONSUME(l11.symbols.hathat);
        const iriVal = SUBRULE(S11.iri);
        return ACTION(() => C.astFactory.termLiteral(
          C.astFactory.sourceLocation(value, iriVal),
          value.value,
          iriVal,
        ));
      } },
    ])) ?? value;
  },
};

export const unaryExpression: SparqlGrammarRule<(typeof S11.unaryExpression)['name'], Expression> = {
  name: 'unaryExpression',
  impl: ({ ACTION, CONSUME, SUBRULE1, SUBRULE2, OR1, OR2 }) => C => OR1<Expression>([
    { ALT: () => SUBRULE1(primaryExpression) },
    { ALT: () => {
      const operator = CONSUME(l11.symbols.exclamation);
      const expr = SUBRULE1(unaryExpression);
      return ACTION(() => C.astFactory.expressionOperation(
        '!',
        [ <T11.Expression> expr ],
        C.astFactory.sourceLocation(operator, expr),
      ));
    } },
    { ALT: () => {
      const operator = OR2([
        { ALT: () => CONSUME(l11.symbols.opPlus) },
        { ALT: () => CONSUME(l11.symbols.opMinus) },
      ]);
      const expr = SUBRULE2(primaryExpression);
      return ACTION(() => C.astFactory.expressionOperation(
        operator.image === '!' ? '!' : (operator.image === '+' ? 'UPLUS' : 'UMINUS'),
        [ <T11.Expression> expr ],
        C.astFactory.sourceLocation(operator, expr),
      ));
    } },
  ]),
};

/**
 * OVERRIDING RULE: {@link S11.triplesBlock}.
 */
export const generateTriplesBlock: SparqlGeneratorRule<'triplesBlock', PatternBgp> = {
  name: 'triplesBlock',
  gImpl: ({ SUBRULE, PRINT_WORD, NEW_LINE, HANDLE_LOC }) => (ast, { astFactory: F }) => {
    for (const [ index, triple ] of ast.triples.entries()) {
      HANDLE_LOC(triple, () => {
        const nextTriple = ast.triples.at(index + 1);
        if (F.isTripleCollection(triple)) {
          SUBRULE(graphNodePath, triple);
          // A top level tripleCollection block means that it is either not used in a triple
          //   - or is the subject of a triple. In case it is the subject,
          //   the identifier of the block will be the subject of the next triple and that subject is not materialized.
          const isSubjectOfTriple = nextTriple?.type === 'triple' &&
            F.isSourceLocationNoMaterialize(nextTriple.subject.loc);
          if (!isSubjectOfTriple) {
            F.printFilter(triple, () => {
              PRINT_WORD('.');
              NEW_LINE();
            });
          }
        } else {
          // Subject
          SUBRULE(graphNodePath, triple.subject);
          F.printFilter(ast, () => PRINT_WORD(''));
          // Predicate
          if (F.isPathPure(triple.predicate)) {
            SUBRULE(S11.pathGenerator, triple.predicate, undefined);
          } else {
            SUBRULE(graphNodePath, triple.predicate);
          }
          F.printFilter(ast, () => PRINT_WORD(''));
          // Object
          SUBRULE(graphNodePath, triple.object);
          SUBRULE(annotationPath, triple.annotations ?? []);

          // If no more things, or a top level collection (only possible if new block was part), or new subject: add DOT
          if (nextTriple === undefined || F.isTripleCollection(nextTriple) ||
            !F.isSourceLocationNoMaterialize(nextTriple.subject.loc)) {
            F.printFilter(ast, () => {
              PRINT_WORD('.');
              NEW_LINE();
            });
          } else if (F.isSourceLocationNoMaterialize(nextTriple.predicate.loc)) {
            F.printFilter(ast, () => PRINT_WORD(','));
          } else {
            F.printFilter(ast, () => {
              PRINT_WORD(';');
              NEW_LINE();
            });
          }
        }
      });
    }
  },
};

/**
 * OVERRIDING RULE: {@link S11.graphTerm}.
 * No retyping is needed since the return type is the same
 * [[149]](https://www.w3.org/TR/sparql12-query/#rRDFLiteral)
 */
export const generateGraphTerm: SparqlGeneratorRule<'graphTerm', GraphTerm> = {
  name: 'graphTerm',
  gImpl: $ => (ast, C) => {
    if (C.astFactory.isTermTriple(ast)) {
      $.SUBRULE(tripleTerm, ast);
    } else {
      S11.graphTerm.gImpl($)(ast, C);
    }
  },
};
