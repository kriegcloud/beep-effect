import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';

export interface OrderedItems<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function OrderedItemsMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OrderedItems & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class OrderedItemsClass extends Resource {
  }
  return OrderedItemsClass as any
}
OrderedItemsMixin.appliesTo = as.OrderedItems
OrderedItemsMixin.createFactory = (env: RdfineEnvironment) => createFactory<OrderedItems>([OrderedItemsMixin], { types: [as.OrderedItems] }, env)
