import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { RelationMixin } from './Relation.js';

export interface OrganicOrFunctionalProvenanceRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Relation<D>, rdfine.RdfResource<D> {
  'organicOrFunctionalProvenanceRelation_role': Rico.OrganicOrFunctionalProvenanceRelation<D> | undefined;
}

export function OrganicOrFunctionalProvenanceRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OrganicOrFunctionalProvenanceRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class OrganicOrFunctionalProvenanceRelationClass extends RelationMixin(Resource) {
    @rdfine.property.resource({ as: [OrganicOrFunctionalProvenanceRelationMixin] })
    'organicOrFunctionalProvenanceRelation_role': Rico.OrganicOrFunctionalProvenanceRelation | undefined;
  }
  return OrganicOrFunctionalProvenanceRelationClass as any
}
OrganicOrFunctionalProvenanceRelationMixin.appliesTo = rico.OrganicOrFunctionalProvenanceRelation
OrganicOrFunctionalProvenanceRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<OrganicOrFunctionalProvenanceRelation>([RelationMixin, OrganicOrFunctionalProvenanceRelationMixin], { types: [rico.OrganicOrFunctionalProvenanceRelation] }, env)
