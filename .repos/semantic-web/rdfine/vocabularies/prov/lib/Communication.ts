import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { ActivityInfluenceMixin } from './ActivityInfluence.js';

export interface Communication<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.ActivityInfluence<D>, rdfine.RdfResource<D> {
}

export function CommunicationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Communication & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class CommunicationClass extends ActivityInfluenceMixin(Resource) {
  }
  return CommunicationClass as any
}
CommunicationMixin.appliesTo = prov.Communication
CommunicationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Communication>([ActivityInfluenceMixin, CommunicationMixin], { types: [prov.Communication] }, env)
