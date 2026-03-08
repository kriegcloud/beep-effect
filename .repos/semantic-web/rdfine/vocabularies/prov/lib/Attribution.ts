import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { AgentInfluenceMixin } from './AgentInfluence.js';

export interface Attribution<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.AgentInfluence<D>, rdfine.RdfResource<D> {
}

export function AttributionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Attribution & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class AttributionClass extends AgentInfluenceMixin(Resource) {
  }
  return AttributionClass as any
}
AttributionMixin.appliesTo = prov.Attribution
AttributionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Attribution>([AgentInfluenceMixin, AttributionMixin], { types: [prov.Attribution] }, env)
