import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { EntityInfluenceMixin } from './EntityInfluence.js';
import { InstantaneousEventMixin } from './InstantaneousEvent.js';

export interface Usage<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.EntityInfluence<D>, Prov.InstantaneousEvent<D>, rdfine.RdfResource<D> {
}

export function UsageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Usage & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class UsageClass extends InstantaneousEventMixin(EntityInfluenceMixin(Resource)) {
  }
  return UsageClass as any
}
UsageMixin.appliesTo = prov.Usage
UsageMixin.createFactory = (env: RdfineEnvironment) => createFactory<Usage>([InstantaneousEventMixin, EntityInfluenceMixin, UsageMixin], { types: [prov.Usage] }, env)
