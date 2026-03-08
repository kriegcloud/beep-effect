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

export interface Generation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.ActivityInfluence<D>, Prov.InstantaneousEvent<D>, rdfine.RdfResource<D> {
}

export function GenerationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Generation & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class GenerationClass extends InstantaneousEventMixin(ActivityInfluenceMixin(Resource)) {
  }
  return GenerationClass as any
}
GenerationMixin.appliesTo = prov.Generation
GenerationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Generation>([InstantaneousEventMixin, ActivityInfluenceMixin, GenerationMixin], { types: [prov.Generation] }, env)
