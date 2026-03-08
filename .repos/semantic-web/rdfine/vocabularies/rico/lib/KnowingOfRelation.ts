import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { AgentToAgentRelationMixin } from './AgentToAgentRelation.js';

export interface KnowingOfRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.AgentToAgentRelation<D>, rdfine.RdfResource<D> {
  'knowingOfRelation_role': Rico.KnowingOfRelation<D> | undefined;
}

export function KnowingOfRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<KnowingOfRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class KnowingOfRelationClass extends AgentToAgentRelationMixin(Resource) {
    @rdfine.property.resource({ as: [KnowingOfRelationMixin] })
    'knowingOfRelation_role': Rico.KnowingOfRelation | undefined;
  }
  return KnowingOfRelationClass as any
}
KnowingOfRelationMixin.appliesTo = rico.KnowingOfRelation
KnowingOfRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<KnowingOfRelation>([AgentToAgentRelationMixin, KnowingOfRelationMixin], { types: [rico.KnowingOfRelation] }, env)
