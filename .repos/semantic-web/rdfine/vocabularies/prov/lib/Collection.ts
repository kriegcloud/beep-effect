import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { EntityMixin } from './Entity.js';

export interface Collection<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Entity<D>, rdfine.RdfResource<D> {
  hadMember: Prov.Entity<D> | undefined;
}

export function CollectionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Collection & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class CollectionClass extends EntityMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [prov.Entity] })
    hadMember: Prov.Entity | undefined;
  }
  return CollectionClass as any
}
CollectionMixin.appliesTo = prov.Collection
CollectionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Collection>([EntityMixin, CollectionMixin], { types: [prov.Collection] }, env)
