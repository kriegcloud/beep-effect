import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { DoseScheduleMixin } from './DoseSchedule.js';

export interface MaximumDoseSchedule<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.DoseSchedule<D>, rdfine.RdfResource<D> {
}

export function MaximumDoseScheduleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MaximumDoseSchedule & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MaximumDoseScheduleClass extends DoseScheduleMixin(Resource) {
  }
  return MaximumDoseScheduleClass as any
}
MaximumDoseScheduleMixin.appliesTo = schema.MaximumDoseSchedule
MaximumDoseScheduleMixin.createFactory = (env: RdfineEnvironment) => createFactory<MaximumDoseSchedule>([DoseScheduleMixin, MaximumDoseScheduleMixin], { types: [schema.MaximumDoseSchedule] }, env)
