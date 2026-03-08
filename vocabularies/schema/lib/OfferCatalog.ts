import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ItemListMixin } from './ItemList.js';

export interface OfferCatalog<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ItemList<D>, rdfine.RdfResource<D> {
}

export function OfferCatalogMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OfferCatalog & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OfferCatalogClass extends ItemListMixin(Resource) {
  }
  return OfferCatalogClass as any
}
OfferCatalogMixin.appliesTo = schema.OfferCatalog
OfferCatalogMixin.createFactory = (env: RdfineEnvironment) => createFactory<OfferCatalog>([ItemListMixin, OfferCatalogMixin], { types: [schema.OfferCatalog] }, env)
