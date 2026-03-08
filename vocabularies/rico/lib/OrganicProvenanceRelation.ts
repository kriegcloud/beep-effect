import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { OrganicOrFunctionalProvenanceRelationMixin } from './OrganicOrFunctionalProvenanceRelation.js';

export interface OrganicProvenanceRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.OrganicOrFunctionalProvenanceRelation<D>, rdfine.RdfResource<D> {
  'organicProvenanceRelation_role': Rico.OrganicProvenanceRelation<D> | undefined;
}

export function OrganicProvenanceRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OrganicProvenanceRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class OrganicProvenanceRelationClass extends OrganicOrFunctionalProvenanceRelationMixin(Resource) {
    @rdfine.property.resource({ as: [OrganicProvenanceRelationMixin] })
    'organicProvenanceRelation_role': Rico.OrganicProvenanceRelation | undefined;
  }
  return OrganicProvenanceRelationClass as any
}
OrganicProvenanceRelationMixin.appliesTo = rico.OrganicProvenanceRelation
OrganicProvenanceRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<OrganicProvenanceRelation>([OrganicOrFunctionalProvenanceRelationMixin, OrganicProvenanceRelationMixin], { types: [rico.OrganicProvenanceRelation] }, env)
