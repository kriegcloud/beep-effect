import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalProcedureMixin } from './MedicalProcedure.js';

export interface TherapeuticProcedure<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalProcedure<D>, rdfine.RdfResource<D> {
  adverseOutcome: Schema.MedicalEntity<D> | undefined;
  doseSchedule: Schema.DoseSchedule<D> | undefined;
  drug: Schema.Drug<D> | undefined;
}

export function TherapeuticProcedureMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TherapeuticProcedure & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TherapeuticProcedureClass extends MedicalProcedureMixin(Resource) {
    @rdfine.property.resource()
    adverseOutcome: Schema.MedicalEntity | undefined;
    @rdfine.property.resource()
    doseSchedule: Schema.DoseSchedule | undefined;
    @rdfine.property.resource()
    drug: Schema.Drug | undefined;
  }
  return TherapeuticProcedureClass as any
}
TherapeuticProcedureMixin.appliesTo = schema.TherapeuticProcedure
TherapeuticProcedureMixin.createFactory = (env: RdfineEnvironment) => createFactory<TherapeuticProcedure>([MedicalProcedureMixin, TherapeuticProcedureMixin], { types: [schema.TherapeuticProcedure] }, env)
