import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { CollectionMixin } from './Collection.js';

export interface EmptyCollection<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Collection<D>, rdfine.RdfResource<D> {
}

export function EmptyCollectionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EmptyCollection & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class EmptyCollectionClass extends CollectionMixin(Resource) {
  }
  return EmptyCollectionClass as any
}
EmptyCollectionMixin.appliesTo = prov.EmptyCollection
EmptyCollectionMixin.createFactory = (env: RdfineEnvironment) => createFactory<EmptyCollection>([CollectionMixin, EmptyCollectionMixin], { types: [prov.EmptyCollection] }, env)
