import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalIntangibleMixin } from './MedicalIntangible.js';

export interface DrugLegalStatus<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalIntangible<D>, rdfine.RdfResource<D> {
  applicableLocation: Schema.AdministrativeArea<D> | undefined;
}

export function DrugLegalStatusMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DrugLegalStatus & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DrugLegalStatusClass extends MedicalIntangibleMixin(Resource) {
    @rdfine.property.resource()
    applicableLocation: Schema.AdministrativeArea | undefined;
  }
  return DrugLegalStatusClass as any
}
DrugLegalStatusMixin.appliesTo = schema.DrugLegalStatus
DrugLegalStatusMixin.createFactory = (env: RdfineEnvironment) => createFactory<DrugLegalStatus>([MedicalIntangibleMixin, DrugLegalStatusMixin], { types: [schema.DrugLegalStatus] }, env)
