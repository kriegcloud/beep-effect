import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { OrganicProvenanceRelationMixin } from './OrganicProvenanceRelation.js';

export interface AccumulationRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.OrganicProvenanceRelation<D>, rdfine.RdfResource<D> {
  'accumulationRelation_role': Rico.AccumulationRelation<D> | undefined;
}

export function AccumulationRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AccumulationRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class AccumulationRelationClass extends OrganicProvenanceRelationMixin(Resource) {
    @rdfine.property.resource({ as: [AccumulationRelationMixin] })
    'accumulationRelation_role': Rico.AccumulationRelation | undefined;
  }
  return AccumulationRelationClass as any
}
AccumulationRelationMixin.appliesTo = rico.AccumulationRelation
AccumulationRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<AccumulationRelation>([OrganicProvenanceRelationMixin, AccumulationRelationMixin], { types: [rico.AccumulationRelation] }, env)
