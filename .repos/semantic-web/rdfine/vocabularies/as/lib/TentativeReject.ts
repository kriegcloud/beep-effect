import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { RejectMixin } from './Reject.js';

export interface TentativeReject<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Reject<D>, rdfine.RdfResource<D> {
}

export function TentativeRejectMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TentativeReject & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class TentativeRejectClass extends RejectMixin(Resource) {
  }
  return TentativeRejectClass as any
}
TentativeRejectMixin.appliesTo = as.TentativeReject
TentativeRejectMixin.createFactory = (env: RdfineEnvironment) => createFactory<TentativeReject>([RejectMixin, TentativeRejectMixin], { types: [as.TentativeReject] }, env)
