import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { RuleMixin } from './Rule.js';

export interface TripleRule<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.Rule<D>, rdfine.RdfResource<D> {
  object: RDF.Term | undefined;
  predicate: RDF.Term | undefined;
  subject: RDF.Term | undefined;
}

export function TripleRuleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TripleRule & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class TripleRuleClass extends RuleMixin(Resource) {
    @rdfine.property()
    object: RDF.Term | undefined;
    @rdfine.property()
    predicate: RDF.Term | undefined;
    @rdfine.property()
    subject: RDF.Term | undefined;
  }
  return TripleRuleClass as any
}
TripleRuleMixin.appliesTo = sh.TripleRule
TripleRuleMixin.createFactory = (env: RdfineEnvironment) => createFactory<TripleRule>([RuleMixin, TripleRuleMixin], { types: [sh.TripleRule] }, env)
