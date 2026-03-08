import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { InfluenceMixin } from './Influence.js';

export interface AgentInfluence<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Influence<D>, rdfine.RdfResource<D> {
  agent: Prov.Agent<D> | undefined;
}

export function AgentInfluenceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AgentInfluence & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class AgentInfluenceClass extends InfluenceMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [prov.Agent] })
    agent: Prov.Agent | undefined;
  }
  return AgentInfluenceClass as any
}
AgentInfluenceMixin.appliesTo = prov.AgentInfluence
AgentInfluenceMixin.createFactory = (env: RdfineEnvironment) => createFactory<AgentInfluence>([InfluenceMixin, AgentInfluenceMixin], { types: [prov.AgentInfluence] }, env)
