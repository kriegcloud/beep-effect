import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Like<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function LikeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Like & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class LikeClass extends ActivityMixin(Resource) {
  }
  return LikeClass as any
}
LikeMixin.appliesTo = as.Like
LikeMixin.createFactory = (env: RdfineEnvironment) => createFactory<Like>([ActivityMixin, LikeMixin], { types: [as.Like] }, env)
