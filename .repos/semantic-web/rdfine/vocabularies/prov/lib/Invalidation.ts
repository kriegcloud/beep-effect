import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { ActivityInfluenceMixin } from './ActivityInfluence.js';
import { InstantaneousEventMixin } from './InstantaneousEvent.js';

export interface Invalidation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.ActivityInfluence<D>, Prov.InstantaneousEvent<D>, rdfine.RdfResource<D> {
}

export function InvalidationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Invalidation & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class InvalidationClass extends InstantaneousEventMixin(ActivityInfluenceMixin(Resource)) {
  }
  return InvalidationClass as any
}
InvalidationMixin.appliesTo = prov.Invalidation
InvalidationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Invalidation>([InstantaneousEventMixin, ActivityInfluenceMixin, InvalidationMixin], { types: [prov.Invalidation] }, env)
