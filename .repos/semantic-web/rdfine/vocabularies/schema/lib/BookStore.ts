import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface BookStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function BookStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BookStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BookStoreClass extends StoreMixin(Resource) {
  }
  return BookStoreClass as any
}
BookStoreMixin.appliesTo = schema.BookStore
BookStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<BookStore>([StoreMixin, BookStoreMixin], { types: [schema.BookStore] }, env)
