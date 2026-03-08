import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { AgentToAgentRelationMixin } from './AgentToAgentRelation.js';

export interface PositionHoldingRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.AgentToAgentRelation<D>, rdfine.RdfResource<D> {
  'positionHoldingRelation_role': Rico.PositionHoldingRelation<D> | undefined;
}

export function PositionHoldingRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PositionHoldingRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class PositionHoldingRelationClass extends AgentToAgentRelationMixin(Resource) {
    @rdfine.property.resource({ as: [PositionHoldingRelationMixin] })
    'positionHoldingRelation_role': Rico.PositionHoldingRelation | undefined;
  }
  return PositionHoldingRelationClass as any
}
PositionHoldingRelationMixin.appliesTo = rico.PositionHoldingRelation
PositionHoldingRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<PositionHoldingRelation>([AgentToAgentRelationMixin, PositionHoldingRelationMixin], { types: [rico.PositionHoldingRelation] }, env)
