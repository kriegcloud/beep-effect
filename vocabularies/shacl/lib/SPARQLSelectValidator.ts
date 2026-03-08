import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { SPARQLSelectExecutableMixin } from './SPARQLSelectExecutable.js';
import { ValidatorMixin } from './Validator.js';

export interface SPARQLSelectValidator<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.SPARQLSelectExecutable<D>, Sh.Validator<D>, rdfine.RdfResource<D> {
  resultAnnotation: Sh.ResultAnnotation<D> | undefined;
}

export function SPARQLSelectValidatorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLSelectValidator & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class SPARQLSelectValidatorClass extends ValidatorMixin(SPARQLSelectExecutableMixin(Resource)) {
    @rdfine.property.resource({ implicitTypes: [sh.ResultAnnotation] })
    resultAnnotation: Sh.ResultAnnotation | undefined;
  }
  return SPARQLSelectValidatorClass as any
}
SPARQLSelectValidatorMixin.appliesTo = sh.SPARQLSelectValidator
SPARQLSelectValidatorMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLSelectValidator>([ValidatorMixin, SPARQLSelectExecutableMixin, SPARQLSelectValidatorMixin], { types: [sh.SPARQLSelectValidator] }, env)
