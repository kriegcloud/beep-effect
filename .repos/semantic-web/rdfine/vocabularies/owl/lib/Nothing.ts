import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';

export interface Nothing<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function NothingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Nothing & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class NothingClass extends Resource {
  }
  return NothingClass as any
}
NothingMixin.appliesTo = owl.Nothing
NothingMixin.createFactory = (env: RdfineEnvironment) => createFactory<Nothing>([NothingMixin], { types: [owl.Nothing] }, env)
