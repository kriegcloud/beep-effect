import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalClinicMixin } from './MedicalClinic.js';

export interface CovidTestingFacility<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalClinic<D>, rdfine.RdfResource<D> {
}

export function CovidTestingFacilityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CovidTestingFacility & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CovidTestingFacilityClass extends MedicalClinicMixin(Resource) {
  }
  return CovidTestingFacilityClass as any
}
CovidTestingFacilityMixin.appliesTo = schema.CovidTestingFacility
CovidTestingFacilityMixin.createFactory = (env: RdfineEnvironment) => createFactory<CovidTestingFacility>([MedicalClinicMixin, CovidTestingFacilityMixin], { types: [schema.CovidTestingFacility] }, env)
