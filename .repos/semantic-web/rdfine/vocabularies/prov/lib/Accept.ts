import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Accept<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Activity<D>, rdfine.RdfResource<D> {
}

export function AcceptMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Accept & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class AcceptClass extends ActivityMixin(Resource) {
  }
  return AcceptClass as any
}
AcceptMixin.appliesTo = prov.Accept
AcceptMixin.createFactory = (env: RdfineEnvironment) => createFactory<Accept>([ActivityMixin, AcceptMixin], { types: [prov.Accept] }, env)
