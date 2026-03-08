import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { AgentHierarchicalRelationMixin } from './AgentHierarchicalRelation.js';
import { AuthorityRelationMixin } from './AuthorityRelation.js';

export interface AgentControlRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.AgentHierarchicalRelation<D>, Rico.AuthorityRelation<D>, rdfine.RdfResource<D> {
  'agentControlRelation_role': Rico.AgentControlRelation<D> | undefined;
}

export function AgentControlRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AgentControlRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class AgentControlRelationClass extends AuthorityRelationMixin(AgentHierarchicalRelationMixin(Resource)) {
    @rdfine.property.resource({ as: [AgentControlRelationMixin] })
    'agentControlRelation_role': Rico.AgentControlRelation | undefined;
  }
  return AgentControlRelationClass as any
}
AgentControlRelationMixin.appliesTo = rico.AgentControlRelation
AgentControlRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<AgentControlRelation>([AuthorityRelationMixin, AgentHierarchicalRelationMixin, AgentControlRelationMixin], { types: [rico.AgentControlRelation] }, env)
