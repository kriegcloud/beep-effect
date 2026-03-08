import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Follow<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function FollowMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Follow & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class FollowClass extends ActivityMixin(Resource) {
  }
  return FollowClass as any
}
FollowMixin.appliesTo = as.Follow
FollowMixin.createFactory = (env: RdfineEnvironment) => createFactory<Follow>([ActivityMixin, FollowMixin], { types: [as.Follow] }, env)
