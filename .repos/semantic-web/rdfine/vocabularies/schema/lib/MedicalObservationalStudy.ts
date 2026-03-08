import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalStudyMixin } from './MedicalStudy.js';

export interface MedicalObservationalStudy<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalStudy<D>, rdfine.RdfResource<D> {
  studyDesign: Schema.MedicalObservationalStudyDesign | undefined;
}

export function MedicalObservationalStudyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalObservationalStudy & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalObservationalStudyClass extends MedicalStudyMixin(Resource) {
    @rdfine.property()
    studyDesign: Schema.MedicalObservationalStudyDesign | undefined;
  }
  return MedicalObservationalStudyClass as any
}
MedicalObservationalStudyMixin.appliesTo = schema.MedicalObservationalStudy
MedicalObservationalStudyMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalObservationalStudy>([MedicalStudyMixin, MedicalObservationalStudyMixin], { types: [schema.MedicalObservationalStudy] }, env)
