import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { RelationMixin } from './Relation.js';

export interface AgentToAgentRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Relation<D>, rdfine.RdfResource<D> {
  'agentToAgentRelation_role': Rico.AgentToAgentRelation<D> | undefined;
}

export function AgentToAgentRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AgentToAgentRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class AgentToAgentRelationClass extends RelationMixin(Resource) {
    @rdfine.property.resource({ as: [AgentToAgentRelationMixin] })
    'agentToAgentRelation_role': Rico.AgentToAgentRelation | undefined;
  }
  return AgentToAgentRelationClass as any
}
AgentToAgentRelationMixin.appliesTo = rico.AgentToAgentRelation
AgentToAgentRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<AgentToAgentRelation>([RelationMixin, AgentToAgentRelationMixin], { types: [rico.AgentToAgentRelation] }, env)
