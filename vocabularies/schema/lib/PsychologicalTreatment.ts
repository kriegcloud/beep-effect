import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TherapeuticProcedureMixin } from './TherapeuticProcedure.js';

export interface PsychologicalTreatment<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TherapeuticProcedure<D>, rdfine.RdfResource<D> {
}

export function PsychologicalTreatmentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PsychologicalTreatment & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PsychologicalTreatmentClass extends TherapeuticProcedureMixin(Resource) {
  }
  return PsychologicalTreatmentClass as any
}
PsychologicalTreatmentMixin.appliesTo = schema.PsychologicalTreatment
PsychologicalTreatmentMixin.createFactory = (env: RdfineEnvironment) => createFactory<PsychologicalTreatment>([TherapeuticProcedureMixin, PsychologicalTreatmentMixin], { types: [schema.PsychologicalTreatment] }, env)
