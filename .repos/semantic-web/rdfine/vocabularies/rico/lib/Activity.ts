import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { EventMixin } from './Event.js';

export interface Activity<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Event<D>, rdfine.RdfResource<D> {
  activityIsContextOfRelation: Rico.AgentTemporalRelation<D> | Rico.MandateRelation<D> | undefined;
  documentedBy: Rico.Instantiation<D> | Rico.RecordResource<D> | undefined;
  hasActivityType: Rico.ActivityType<D> | undefined;
  isOrganicOrFunctionalProvenanceOf: Rico.Instantiation<D> | Rico.RecordResource<D> | undefined;
  isOrWasPerformedBy: Rico.Agent<D> | undefined;
}

export function ActivityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Activity & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class ActivityClass extends EventMixin(Resource) {
    @rdfine.property.resource()
    activityIsContextOfRelation: Rico.AgentTemporalRelation | Rico.MandateRelation | undefined;
    @rdfine.property.resource()
    documentedBy: Rico.Instantiation | Rico.RecordResource | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.ActivityType] })
    hasActivityType: Rico.ActivityType | undefined;
    @rdfine.property.resource()
    isOrganicOrFunctionalProvenanceOf: Rico.Instantiation | Rico.RecordResource | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    isOrWasPerformedBy: Rico.Agent | undefined;
  }
  return ActivityClass as any
}
ActivityMixin.appliesTo = rico.Activity
ActivityMixin.createFactory = (env: RdfineEnvironment) => createFactory<Activity>([EventMixin, ActivityMixin], { types: [rico.Activity] }, env)
