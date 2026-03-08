import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalProcedureMixin } from './MedicalProcedure.js';

export interface DiagnosticProcedure<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalProcedure<D>, rdfine.RdfResource<D> {
}

export function DiagnosticProcedureMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DiagnosticProcedure & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DiagnosticProcedureClass extends MedicalProcedureMixin(Resource) {
  }
  return DiagnosticProcedureClass as any
}
DiagnosticProcedureMixin.appliesTo = schema.DiagnosticProcedure
DiagnosticProcedureMixin.createFactory = (env: RdfineEnvironment) => createFactory<DiagnosticProcedure>([MedicalProcedureMixin, DiagnosticProcedureMixin], { types: [schema.DiagnosticProcedure] }, env)
