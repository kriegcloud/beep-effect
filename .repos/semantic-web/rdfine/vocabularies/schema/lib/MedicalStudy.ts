import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface MedicalStudy<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
  healthCondition: Schema.MedicalCondition<D> | undefined;
  sponsor: Schema.Organization<D> | Schema.Person<D> | undefined;
  status: string | undefined;
  statusTerm: Schema.EventStatusType | Schema.MedicalStudyStatus | undefined;
  studyLocation: Schema.AdministrativeArea<D> | undefined;
  studySubject: Schema.MedicalEntity<D> | undefined;
}

export function MedicalStudyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalStudy & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalStudyClass extends MedicalEntityMixin(Resource) {
    @rdfine.property.resource()
    healthCondition: Schema.MedicalCondition | undefined;
    @rdfine.property.resource()
    sponsor: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    status: string | undefined;
    @rdfine.property({ path: schema.status })
    statusTerm: Schema.EventStatusType | Schema.MedicalStudyStatus | undefined;
    @rdfine.property.resource()
    studyLocation: Schema.AdministrativeArea | undefined;
    @rdfine.property.resource()
    studySubject: Schema.MedicalEntity | undefined;
  }
  return MedicalStudyClass as any
}
MedicalStudyMixin.appliesTo = schema.MedicalStudy
MedicalStudyMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalStudy>([MedicalEntityMixin, MedicalStudyMixin], { types: [schema.MedicalStudy] }, env)
