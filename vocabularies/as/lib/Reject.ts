import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Reject<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function RejectMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Reject & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class RejectClass extends ActivityMixin(Resource) {
  }
  return RejectClass as any
}
RejectMixin.appliesTo = as.Reject
RejectMixin.createFactory = (env: RdfineEnvironment) => createFactory<Reject>([ActivityMixin, RejectMixin], { types: [as.Reject] }, env)
