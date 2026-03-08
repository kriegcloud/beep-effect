import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { AgentToAgentRelationMixin } from './AgentToAgentRelation.js';

export interface WorkRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.AgentToAgentRelation<D>, rdfine.RdfResource<D> {
  'workRelation_role': Rico.WorkRelation<D> | undefined;
}

export function WorkRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WorkRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class WorkRelationClass extends AgentToAgentRelationMixin(Resource) {
    @rdfine.property.resource({ as: [WorkRelationMixin] })
    'workRelation_role': Rico.WorkRelation | undefined;
  }
  return WorkRelationClass as any
}
WorkRelationMixin.appliesTo = rico.WorkRelation
WorkRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<WorkRelation>([AgentToAgentRelationMixin, WorkRelationMixin], { types: [rico.WorkRelation] }, env)
