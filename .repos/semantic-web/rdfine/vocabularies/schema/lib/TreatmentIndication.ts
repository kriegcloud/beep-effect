import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalIndicationMixin } from './MedicalIndication.js';

export interface TreatmentIndication<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalIndication<D>, rdfine.RdfResource<D> {
}

export function TreatmentIndicationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TreatmentIndication & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TreatmentIndicationClass extends MedicalIndicationMixin(Resource) {
  }
  return TreatmentIndicationClass as any
}
TreatmentIndicationMixin.appliesTo = schema.TreatmentIndication
TreatmentIndicationMixin.createFactory = (env: RdfineEnvironment) => createFactory<TreatmentIndication>([MedicalIndicationMixin, TreatmentIndicationMixin], { types: [schema.TreatmentIndication] }, env)
