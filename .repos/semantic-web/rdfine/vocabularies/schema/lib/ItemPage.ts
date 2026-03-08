import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { WebPageMixin } from './WebPage.js';

export interface ItemPage<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.WebPage<D>, rdfine.RdfResource<D> {
}

export function ItemPageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ItemPage & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ItemPageClass extends WebPageMixin(Resource) {
  }
  return ItemPageClass as any
}
ItemPageMixin.appliesTo = schema.ItemPage
ItemPageMixin.createFactory = (env: RdfineEnvironment) => createFactory<ItemPage>([WebPageMixin, ItemPageMixin], { types: [schema.ItemPage] }, env)
