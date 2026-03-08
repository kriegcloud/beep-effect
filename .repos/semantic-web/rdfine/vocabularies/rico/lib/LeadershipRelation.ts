import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { AgentControlRelationMixin } from './AgentControlRelation.js';

export interface LeadershipRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.AgentControlRelation<D>, rdfine.RdfResource<D> {
  'leadershipRelation_role': Rico.LeadershipRelation<D> | undefined;
  leadershipWithPosition: Rico.Position<D> | undefined;
}

export function LeadershipRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LeadershipRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class LeadershipRelationClass extends AgentControlRelationMixin(Resource) {
    @rdfine.property.resource({ as: [LeadershipRelationMixin] })
    'leadershipRelation_role': Rico.LeadershipRelation | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Position] })
    leadershipWithPosition: Rico.Position | undefined;
  }
  return LeadershipRelationClass as any
}
LeadershipRelationMixin.appliesTo = rico.LeadershipRelation
LeadershipRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<LeadershipRelation>([AgentControlRelationMixin, LeadershipRelationMixin], { types: [rico.LeadershipRelation] }, env)
