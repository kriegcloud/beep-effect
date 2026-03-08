import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { hydra } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Hydra from '../index.js';
import { StatusMixin } from './Status.js';

export interface Error<D extends RDF.DatasetCore = RDF.DatasetCore> extends Hydra.Status<D>, rdfine.RdfResource<D> {
}

export function ErrorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Error & RdfResourceCore> & Base {
  @rdfine.namespace(hydra)
  class ErrorClass extends StatusMixin(Resource) {
  }
  return ErrorClass as any
}
ErrorMixin.appliesTo = hydra.Error
ErrorMixin.createFactory = (env: RdfineEnvironment) => createFactory<Error>([StatusMixin, ErrorMixin], { types: [hydra.Error] }, env)
