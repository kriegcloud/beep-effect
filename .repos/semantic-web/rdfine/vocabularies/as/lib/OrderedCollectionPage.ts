import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { CollectionPageMixin } from './CollectionPage.js';
import { OrderedCollectionMixin } from './OrderedCollection.js';

export interface OrderedCollectionPage<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.CollectionPage<D>, As.OrderedCollection<D>, rdfine.RdfResource<D> {
  startIndex: number | undefined;
}

export function OrderedCollectionPageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OrderedCollectionPage & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class OrderedCollectionPageClass extends OrderedCollectionMixin(CollectionPageMixin(Resource)) {
    @rdfine.property.literal({ type: Number })
    startIndex: number | undefined;
  }
  return OrderedCollectionPageClass as any
}
OrderedCollectionPageMixin.appliesTo = as.OrderedCollectionPage
OrderedCollectionPageMixin.createFactory = (env: RdfineEnvironment) => createFactory<OrderedCollectionPage>([OrderedCollectionMixin, CollectionPageMixin, OrderedCollectionPageMixin], { types: [as.OrderedCollectionPage] }, env)
