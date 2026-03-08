import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Collection<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  collectionSize: number | undefined;
}

export function CollectionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Collection & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CollectionClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.literal({ type: Number })
    collectionSize: number | undefined;
  }
  return CollectionClass as any
}
CollectionMixin.appliesTo = schema.Collection
CollectionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Collection>([CreativeWorkMixin, CollectionMixin], { types: [schema.Collection] }, env)
