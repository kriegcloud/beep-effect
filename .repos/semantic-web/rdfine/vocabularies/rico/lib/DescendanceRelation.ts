import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { AgentTemporalRelationMixin } from './AgentTemporalRelation.js';
import { FamilyRelationMixin } from './FamilyRelation.js';

export interface DescendanceRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.AgentTemporalRelation<D>, Rico.FamilyRelation<D>, rdfine.RdfResource<D> {
  'descendanceRelation_role': Rico.DescendanceRelation<D> | undefined;
}

export function DescendanceRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DescendanceRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class DescendanceRelationClass extends FamilyRelationMixin(AgentTemporalRelationMixin(Resource)) {
    @rdfine.property.resource({ as: [DescendanceRelationMixin] })
    'descendanceRelation_role': Rico.DescendanceRelation | undefined;
  }
  return DescendanceRelationClass as any
}
DescendanceRelationMixin.appliesTo = rico.DescendanceRelation
DescendanceRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<DescendanceRelation>([FamilyRelationMixin, AgentTemporalRelationMixin, DescendanceRelationMixin], { types: [rico.DescendanceRelation] }, env)
