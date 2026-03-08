import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface MovieRentalStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function MovieRentalStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MovieRentalStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MovieRentalStoreClass extends StoreMixin(Resource) {
  }
  return MovieRentalStoreClass as any
}
MovieRentalStoreMixin.appliesTo = schema.MovieRentalStore
MovieRentalStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<MovieRentalStore>([StoreMixin, MovieRentalStoreMixin], { types: [schema.MovieRentalStore] }, env)
