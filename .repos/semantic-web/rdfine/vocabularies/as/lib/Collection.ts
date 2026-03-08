import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ObjectMixin } from './Object.js';

export interface Collection<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
  current: As.CollectionPage<D> | As.Link<D> | undefined;
  first: As.CollectionPage<D> | As.Link<D> | undefined;
  items: As.OrderedItems<D> | undefined;
  last: As.CollectionPage<D> | As.Link<D> | undefined;
  totalItems: number | undefined;
}

export function CollectionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Collection & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class CollectionClass extends ObjectMixin(Resource) {
    @rdfine.property.resource()
    current: As.CollectionPage | As.Link | undefined;
    @rdfine.property.resource()
    first: As.CollectionPage | As.Link | undefined;
    @rdfine.property.resource({ implicitTypes: [as.OrderedItems] })
    items: As.OrderedItems | undefined;
    @rdfine.property.resource()
    last: As.CollectionPage | As.Link | undefined;
    @rdfine.property.literal({ type: Number })
    totalItems: number | undefined;
  }
  return CollectionClass as any
}
CollectionMixin.appliesTo = as.Collection
CollectionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Collection>([ObjectMixin, CollectionMixin], { types: [as.Collection] }, env)
