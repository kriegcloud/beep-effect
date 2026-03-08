import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Move<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function MoveMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Move & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class MoveClass extends ActivityMixin(Resource) {
  }
  return MoveClass as any
}
MoveMixin.appliesTo = as.Move
MoveMixin.createFactory = (env: RdfineEnvironment) => createFactory<Move>([ActivityMixin, MoveMixin], { types: [as.Move] }, env)
