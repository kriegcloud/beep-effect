import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ThingMixin } from './Thing.js';

export interface MedicalEntity<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Thing<D>, rdfine.RdfResource<D> {
  code: Schema.MedicalCode<D> | undefined;
  funding: Schema.Grant<D> | undefined;
  guideline: Schema.MedicalGuideline<D> | undefined;
  legalStatus: Schema.DrugLegalStatus<D> | undefined;
  legalStatusLiteral: string | undefined;
  medicineSystem: Schema.MedicineSystem | undefined;
  recognizingAuthority: Schema.Organization<D> | undefined;
  relevantSpecialty: Schema.MedicalSpecialty | undefined;
  study: Schema.MedicalStudy<D> | undefined;
}

export function MedicalEntityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalEntity & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalEntityClass extends ThingMixin(Resource) {
    @rdfine.property.resource()
    code: Schema.MedicalCode | undefined;
    @rdfine.property.resource()
    funding: Schema.Grant | undefined;
    @rdfine.property.resource()
    guideline: Schema.MedicalGuideline | undefined;
    @rdfine.property.resource()
    legalStatus: Schema.DrugLegalStatus | undefined;
    @rdfine.property.literal({ path: schema.legalStatus })
    legalStatusLiteral: string | undefined;
    @rdfine.property()
    medicineSystem: Schema.MedicineSystem | undefined;
    @rdfine.property.resource()
    recognizingAuthority: Schema.Organization | undefined;
    @rdfine.property()
    relevantSpecialty: Schema.MedicalSpecialty | undefined;
    @rdfine.property.resource()
    study: Schema.MedicalStudy | undefined;
  }
  return MedicalEntityClass as any
}
MedicalEntityMixin.appliesTo = schema.MedicalEntity
MedicalEntityMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalEntity>([ThingMixin, MedicalEntityMixin], { types: [schema.MedicalEntity] }, env)
