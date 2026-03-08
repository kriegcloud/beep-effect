import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { AcceptMixin } from './Accept.js';

export interface TentativeAccept<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Accept<D>, rdfine.RdfResource<D> {
}

export function TentativeAcceptMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TentativeAccept & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class TentativeAcceptClass extends AcceptMixin(Resource) {
  }
  return TentativeAcceptClass as any
}
TentativeAcceptMixin.appliesTo = as.TentativeAccept
TentativeAcceptMixin.createFactory = (env: RdfineEnvironment) => createFactory<TentativeAccept>([AcceptMixin, TentativeAcceptMixin], { types: [as.TentativeAccept] }, env)
