import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { InfluenceMixin } from './Influence.js';

export interface EntityInfluence<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Influence<D>, rdfine.RdfResource<D> {
  entity: Prov.Entity<D> | undefined;
}

export function EntityInfluenceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EntityInfluence & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class EntityInfluenceClass extends InfluenceMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [prov.Entity] })
    entity: Prov.Entity | undefined;
  }
  return EntityInfluenceClass as any
}
EntityInfluenceMixin.appliesTo = prov.EntityInfluence
EntityInfluenceMixin.createFactory = (env: RdfineEnvironment) => createFactory<EntityInfluence>([InfluenceMixin, EntityInfluenceMixin], { types: [prov.EntityInfluence] }, env)
