import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { AbstractResultMixin } from './AbstractResult.js';

export interface ValidationResult<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.AbstractResult<D>, rdfine.RdfResource<D> {
}

export function ValidationResultMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ValidationResult & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class ValidationResultClass extends AbstractResultMixin(Resource) {
  }
  return ValidationResultClass as any
}
ValidationResultMixin.appliesTo = sh.ValidationResult
ValidationResultMixin.createFactory = (env: RdfineEnvironment) => createFactory<ValidationResult>([AbstractResultMixin, ValidationResultMixin], { types: [sh.ValidationResult] }, env)
