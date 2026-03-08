import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { hydra } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Hydra from '../index.js';
import { ResourceMixin } from './Resource.js';
import { CollectionExMixin } from '../extensions/CollectionEx.js';

export interface Collection<M extends RdfResourceCore<any> = RdfResourceCore<any>, D extends RDF.DatasetCore = RDF.DatasetCore> extends Hydra.Resource<D>, rdfine.RdfResource<D> {
  member: Array<Hydra.Resource<D> & M>;
  totalItems: number | undefined;
}

export function CollectionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Collection & RdfResourceCore> & Base {
  @rdfine.namespace(hydra)
  class CollectionClass extends CollectionExMixin(ResourceMixin(Resource)) {
    @rdfine.property.resource({ values: 'array', implicitTypes: [hydra.Resource] })
    member!: Array<Hydra.Resource>;
    @rdfine.property.literal({ type: Number })
    totalItems: number | undefined;
  }
  return CollectionClass as any
}
CollectionMixin.appliesTo = hydra.Collection
CollectionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Collection>([ResourceMixin, CollectionMixin], { types: [hydra.Collection] }, env)
