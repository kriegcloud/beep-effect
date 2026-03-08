import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalProcedureMixin } from './MedicalProcedure.js';
import { MedicalTherapyMixin } from './MedicalTherapy.js';

export interface PalliativeProcedure<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalProcedure<D>, Schema.MedicalTherapy<D>, rdfine.RdfResource<D> {
}

export function PalliativeProcedureMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PalliativeProcedure & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PalliativeProcedureClass extends MedicalTherapyMixin(MedicalProcedureMixin(Resource)) {
  }
  return PalliativeProcedureClass as any
}
PalliativeProcedureMixin.appliesTo = schema.PalliativeProcedure
PalliativeProcedureMixin.createFactory = (env: RdfineEnvironment) => createFactory<PalliativeProcedure>([MedicalTherapyMixin, MedicalProcedureMixin, PalliativeProcedureMixin], { types: [schema.PalliativeProcedure] }, env)
