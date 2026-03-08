import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalTherapyMixin } from './MedicalTherapy.js';

export interface RadiationTherapy<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalTherapy<D>, rdfine.RdfResource<D> {
}

export function RadiationTherapyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RadiationTherapy & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RadiationTherapyClass extends MedicalTherapyMixin(Resource) {
  }
  return RadiationTherapyClass as any
}
RadiationTherapyMixin.appliesTo = schema.RadiationTherapy
RadiationTherapyMixin.createFactory = (env: RdfineEnvironment) => createFactory<RadiationTherapy>([MedicalTherapyMixin, RadiationTherapyMixin], { types: [schema.RadiationTherapy] }, env)
