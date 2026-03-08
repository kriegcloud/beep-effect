import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalSignMixin } from './MedicalSign.js';

export interface VitalSign<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalSign<D>, rdfine.RdfResource<D> {
}

export function VitalSignMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<VitalSign & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class VitalSignClass extends MedicalSignMixin(Resource) {
  }
  return VitalSignClass as any
}
VitalSignMixin.appliesTo = schema.VitalSign
VitalSignMixin.createFactory = (env: RdfineEnvironment) => createFactory<VitalSign>([MedicalSignMixin, VitalSignMixin], { types: [schema.VitalSign] }, env)
