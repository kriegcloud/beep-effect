import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizeActionMixin } from './OrganizeAction.js';

export interface BookmarkAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.OrganizeAction<D>, rdfine.RdfResource<D> {
}

export function BookmarkActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BookmarkAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BookmarkActionClass extends OrganizeActionMixin(Resource) {
  }
  return BookmarkActionClass as any
}
BookmarkActionMixin.appliesTo = schema.BookmarkAction
BookmarkActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<BookmarkAction>([OrganizeActionMixin, BookmarkActionMixin], { types: [schema.BookmarkAction] }, env)
