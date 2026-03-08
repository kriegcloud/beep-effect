import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';

export interface Agent<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  actedOnBehalfOf: Prov.Agent<D> | undefined;
  atLocation: Prov.Location<D> | undefined;
  qualifiedDelegation: Prov.Delegation<D> | undefined;
  qualifiedInfluence: Prov.Influence<D> | undefined;
  wasInfluencedBy: Prov.Activity<D> | Prov.Agent<D> | Prov.Entity<D> | undefined;
}

export function AgentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Agent & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class AgentClass extends Resource {
    @rdfine.property.resource({ as: [AgentMixin] })
    actedOnBehalfOf: Prov.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Location] })
    atLocation: Prov.Location | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Delegation] })
    qualifiedDelegation: Prov.Delegation | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Influence] })
    qualifiedInfluence: Prov.Influence | undefined;
    @rdfine.property.resource()
    wasInfluencedBy: Prov.Activity | Prov.Agent | Prov.Entity | undefined;
  }
  return AgentClass as any
}
AgentMixin.appliesTo = prov.Agent
AgentMixin.createFactory = (env: RdfineEnvironment) => createFactory<Agent>([AgentMixin], { types: [prov.Agent] }, env)
