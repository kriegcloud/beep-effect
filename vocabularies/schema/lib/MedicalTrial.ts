import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalStudyMixin } from './MedicalStudy.js';

export interface MedicalTrial<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalStudy<D>, rdfine.RdfResource<D> {
  trialDesign: Schema.MedicalTrialDesign | undefined;
}

export function MedicalTrialMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalTrial & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalTrialClass extends MedicalStudyMixin(Resource) {
    @rdfine.property()
    trialDesign: Schema.MedicalTrialDesign | undefined;
  }
  return MedicalTrialClass as any
}
MedicalTrialMixin.appliesTo = schema.MedicalTrial
MedicalTrialMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalTrial>([MedicalStudyMixin, MedicalTrialMixin], { types: [schema.MedicalTrial] }, env)
