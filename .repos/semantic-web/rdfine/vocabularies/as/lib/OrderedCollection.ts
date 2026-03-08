import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';

export interface OrderedCollection<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function OrderedCollectionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OrderedCollection & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class OrderedCollectionClass extends Resource {
  }
  return OrderedCollectionClass as any
}
OrderedCollectionMixin.appliesTo = as.OrderedCollection
OrderedCollectionMixin.createFactory = (env: RdfineEnvironment) => createFactory<OrderedCollection>([OrderedCollectionMixin], { types: [as.OrderedCollection] }, env)
