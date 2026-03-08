import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { RuleMixin } from './Rule.js';
import { SPARQLConstructExecutableMixin } from './SPARQLConstructExecutable.js';

export interface SPARQLRule<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.Rule<D>, Sh.SPARQLConstructExecutable<D>, rdfine.RdfResource<D> {
}

export function SPARQLRuleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLRule & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class SPARQLRuleClass extends SPARQLConstructExecutableMixin(RuleMixin(Resource)) {
  }
  return SPARQLRuleClass as any
}
SPARQLRuleMixin.appliesTo = sh.SPARQLRule
SPARQLRuleMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLRule>([SPARQLConstructExecutableMixin, RuleMixin, SPARQLRuleMixin], { types: [sh.SPARQLRule] }, env)
