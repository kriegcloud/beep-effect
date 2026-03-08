import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { AgentMixin } from './Agent.js';

export interface SoftwareAgent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Agent<D>, rdfine.RdfResource<D> {
}

export function SoftwareAgentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SoftwareAgent & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class SoftwareAgentClass extends AgentMixin(Resource) {
  }
  return SoftwareAgentClass as any
}
SoftwareAgentMixin.appliesTo = prov.SoftwareAgent
SoftwareAgentMixin.createFactory = (env: RdfineEnvironment) => createFactory<SoftwareAgent>([AgentMixin, SoftwareAgentMixin], { types: [prov.SoftwareAgent] }, env)
