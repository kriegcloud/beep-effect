import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Leave<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function LeaveMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Leave & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class LeaveClass extends ActivityMixin(Resource) {
  }
  return LeaveClass as any
}
LeaveMixin.appliesTo = as.Leave
LeaveMixin.createFactory = (env: RdfineEnvironment) => createFactory<Leave>([ActivityMixin, LeaveMixin], { types: [as.Leave] }, env)
