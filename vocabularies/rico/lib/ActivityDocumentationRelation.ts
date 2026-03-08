import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { EventRelationMixin } from './EventRelation.js';
import { OrganicOrFunctionalProvenanceRelationMixin } from './OrganicOrFunctionalProvenanceRelation.js';

export interface ActivityDocumentationRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.EventRelation<D>, Rico.OrganicOrFunctionalProvenanceRelation<D>, rdfine.RdfResource<D> {
  'activityDocumentationRelation_role': Rico.ActivityDocumentationRelation<D> | undefined;
}

export function ActivityDocumentationRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ActivityDocumentationRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class ActivityDocumentationRelationClass extends OrganicOrFunctionalProvenanceRelationMixin(EventRelationMixin(Resource)) {
    @rdfine.property.resource({ as: [ActivityDocumentationRelationMixin] })
    'activityDocumentationRelation_role': Rico.ActivityDocumentationRelation | undefined;
  }
  return ActivityDocumentationRelationClass as any
}
ActivityDocumentationRelationMixin.appliesTo = rico.ActivityDocumentationRelation
ActivityDocumentationRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<ActivityDocumentationRelation>([OrganicOrFunctionalProvenanceRelationMixin, EventRelationMixin, ActivityDocumentationRelationMixin], { types: [rico.ActivityDocumentationRelation] }, env)
