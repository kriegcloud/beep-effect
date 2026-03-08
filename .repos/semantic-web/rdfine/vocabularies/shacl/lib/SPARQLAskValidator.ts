import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { SPARQLAskExecutableMixin } from './SPARQLAskExecutable.js';
import { ValidatorMixin } from './Validator.js';

export interface SPARQLAskValidator<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.SPARQLAskExecutable<D>, Sh.Validator<D>, rdfine.RdfResource<D> {
}

export function SPARQLAskValidatorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLAskValidator & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class SPARQLAskValidatorClass extends ValidatorMixin(SPARQLAskExecutableMixin(Resource)) {
  }
  return SPARQLAskValidatorClass as any
}
SPARQLAskValidatorMixin.appliesTo = sh.SPARQLAskValidator
SPARQLAskValidatorMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLAskValidator>([ValidatorMixin, SPARQLAskExecutableMixin, SPARQLAskValidatorMixin], { types: [sh.SPARQLAskValidator] }, env)
