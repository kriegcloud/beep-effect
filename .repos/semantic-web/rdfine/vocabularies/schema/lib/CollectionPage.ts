import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { WebPageMixin } from './WebPage.js';

export interface CollectionPage<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.WebPage<D>, rdfine.RdfResource<D> {
}

export function CollectionPageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CollectionPage & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CollectionPageClass extends WebPageMixin(Resource) {
  }
  return CollectionPageClass as any
}
CollectionPageMixin.appliesTo = schema.CollectionPage
CollectionPageMixin.createFactory = (env: RdfineEnvironment) => createFactory<CollectionPage>([WebPageMixin, CollectionPageMixin], { types: [schema.CollectionPage] }, env)
