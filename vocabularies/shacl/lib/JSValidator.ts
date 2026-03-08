import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { JSExecutableMixin } from './JSExecutable.js';
import { ValidatorMixin } from './Validator.js';

export interface JSValidator<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.JSExecutable<D>, Sh.Validator<D>, rdfine.RdfResource<D> {
}

export function JSValidatorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<JSValidator & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class JSValidatorClass extends ValidatorMixin(JSExecutableMixin(Resource)) {
  }
  return JSValidatorClass as any
}
JSValidatorMixin.appliesTo = sh.JSValidator
JSValidatorMixin.createFactory = (env: RdfineEnvironment) => createFactory<JSValidator>([ValidatorMixin, JSExecutableMixin, JSValidatorMixin], { types: [sh.JSValidator] }, env)
