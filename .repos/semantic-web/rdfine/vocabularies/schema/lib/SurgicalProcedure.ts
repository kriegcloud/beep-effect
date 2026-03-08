import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalProcedureMixin } from './MedicalProcedure.js';

export interface SurgicalProcedure<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalProcedure<D>, rdfine.RdfResource<D> {
}

export function SurgicalProcedureMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SurgicalProcedure & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SurgicalProcedureClass extends MedicalProcedureMixin(Resource) {
  }
  return SurgicalProcedureClass as any
}
SurgicalProcedureMixin.appliesTo = schema.SurgicalProcedure
SurgicalProcedureMixin.createFactory = (env: RdfineEnvironment) => createFactory<SurgicalProcedure>([MedicalProcedureMixin, SurgicalProcedureMixin], { types: [schema.SurgicalProcedure] }, env)
