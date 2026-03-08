import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalTherapyMixin } from './MedicalTherapy.js';

export interface PhysicalTherapy<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalTherapy<D>, rdfine.RdfResource<D> {
}

export function PhysicalTherapyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PhysicalTherapy & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PhysicalTherapyClass extends MedicalTherapyMixin(Resource) {
  }
  return PhysicalTherapyClass as any
}
PhysicalTherapyMixin.appliesTo = schema.PhysicalTherapy
PhysicalTherapyMixin.createFactory = (env: RdfineEnvironment) => createFactory<PhysicalTherapy>([MedicalTherapyMixin, PhysicalTherapyMixin], { types: [schema.PhysicalTherapy] }, env)
