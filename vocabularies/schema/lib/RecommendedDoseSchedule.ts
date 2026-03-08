import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { DoseScheduleMixin } from './DoseSchedule.js';

export interface RecommendedDoseSchedule<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.DoseSchedule<D>, rdfine.RdfResource<D> {
}

export function RecommendedDoseScheduleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RecommendedDoseSchedule & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RecommendedDoseScheduleClass extends DoseScheduleMixin(Resource) {
  }
  return RecommendedDoseScheduleClass as any
}
RecommendedDoseScheduleMixin.appliesTo = schema.RecommendedDoseSchedule
RecommendedDoseScheduleMixin.createFactory = (env: RdfineEnvironment) => createFactory<RecommendedDoseSchedule>([DoseScheduleMixin, RecommendedDoseScheduleMixin], { types: [schema.RecommendedDoseSchedule] }, env)
