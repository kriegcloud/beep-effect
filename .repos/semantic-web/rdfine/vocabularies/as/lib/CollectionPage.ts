import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { CollectionMixin } from './Collection.js';

export interface CollectionPage<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Collection<D>, rdfine.RdfResource<D> {
  next: As.CollectionPage<D> | As.Link<D> | undefined;
  partOf: As.Collection<D> | As.Link<D> | undefined;
  prev: As.CollectionPage<D> | As.Link<D> | undefined;
}

export function CollectionPageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CollectionPage & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class CollectionPageClass extends CollectionMixin(Resource) {
    @rdfine.property.resource()
    next: As.CollectionPage | As.Link | undefined;
    @rdfine.property.resource()
    partOf: As.Collection | As.Link | undefined;
    @rdfine.property.resource()
    prev: As.CollectionPage | As.Link | undefined;
  }
  return CollectionPageClass as any
}
CollectionPageMixin.appliesTo = as.CollectionPage
CollectionPageMixin.createFactory = (env: RdfineEnvironment) => createFactory<CollectionPage>([CollectionMixin, CollectionPageMixin], { types: [as.CollectionPage] }, env)
