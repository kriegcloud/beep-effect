import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { skos } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Skos from '../index.js';
import type * as Rdf from '@rdfine/rdf';
import { CollectionMixin } from './Collection.js';
import { ListMixin as RdfListMixin } from '@rdfine/rdf/lib/List';

export interface OrderedCollection<D extends RDF.DatasetCore = RDF.DatasetCore> extends Skos.Collection<D>, rdfine.RdfResource<D> {
  memberList: Rdf.List<D> | undefined;
}

export function OrderedCollectionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OrderedCollection & RdfResourceCore> & Base {
  @rdfine.namespace(skos)
  class OrderedCollectionClass extends CollectionMixin(Resource) {
    @rdfine.property.resource({ as: [RdfListMixin] })
    memberList: Rdf.List | undefined;
  }
  return OrderedCollectionClass as any
}
OrderedCollectionMixin.appliesTo = skos.OrderedCollection
OrderedCollectionMixin.createFactory = (env: RdfineEnvironment) => createFactory<OrderedCollection>([CollectionMixin, OrderedCollectionMixin], { types: [skos.OrderedCollection] }, env)
