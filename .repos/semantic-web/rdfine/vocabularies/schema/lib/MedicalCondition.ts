import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface MedicalCondition<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
  associatedAnatomy: Schema.AnatomicalStructure<D> | Schema.AnatomicalSystem<D> | Schema.SuperficialAnatomy<D> | undefined;
  differentialDiagnosis: Schema.DDxElement<D> | undefined;
  drug: Schema.Drug<D> | undefined;
  epidemiology: string | undefined;
  expectedPrognosis: string | undefined;
  naturalProgression: string | undefined;
  pathophysiology: string | undefined;
  possibleComplication: string | undefined;
  possibleTreatment: Schema.MedicalTherapy<D> | undefined;
  primaryPrevention: Schema.MedicalTherapy<D> | undefined;
  riskFactor: Schema.MedicalRiskFactor<D> | undefined;
  secondaryPrevention: Schema.MedicalTherapy<D> | undefined;
  signOrSymptom: Schema.MedicalSignOrSymptom<D> | undefined;
  stage: Schema.MedicalConditionStage<D> | undefined;
  status: string | undefined;
  statusTerm: Schema.EventStatusType | Schema.MedicalStudyStatus | undefined;
  typicalTest: Schema.MedicalTest<D> | undefined;
}

export function MedicalConditionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalCondition & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalConditionClass extends MedicalEntityMixin(Resource) {
    @rdfine.property.resource()
    associatedAnatomy: Schema.AnatomicalStructure | Schema.AnatomicalSystem | Schema.SuperficialAnatomy | undefined;
    @rdfine.property.resource()
    differentialDiagnosis: Schema.DDxElement | undefined;
    @rdfine.property.resource()
    drug: Schema.Drug | undefined;
    @rdfine.property.literal()
    epidemiology: string | undefined;
    @rdfine.property.literal()
    expectedPrognosis: string | undefined;
    @rdfine.property.literal()
    naturalProgression: string | undefined;
    @rdfine.property.literal()
    pathophysiology: string | undefined;
    @rdfine.property.literal()
    possibleComplication: string | undefined;
    @rdfine.property.resource()
    possibleTreatment: Schema.MedicalTherapy | undefined;
    @rdfine.property.resource()
    primaryPrevention: Schema.MedicalTherapy | undefined;
    @rdfine.property.resource()
    riskFactor: Schema.MedicalRiskFactor | undefined;
    @rdfine.property.resource()
    secondaryPrevention: Schema.MedicalTherapy | undefined;
    @rdfine.property.resource()
    signOrSymptom: Schema.MedicalSignOrSymptom | undefined;
    @rdfine.property.resource()
    stage: Schema.MedicalConditionStage | undefined;
    @rdfine.property.literal()
    status: string | undefined;
    @rdfine.property({ path: schema.status })
    statusTerm: Schema.EventStatusType | Schema.MedicalStudyStatus | undefined;
    @rdfine.property.resource()
    typicalTest: Schema.MedicalTest | undefined;
  }
  return MedicalConditionClass as any
}
MedicalConditionMixin.appliesTo = schema.MedicalCondition
MedicalConditionMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalCondition>([MedicalEntityMixin, MedicalConditionMixin], { types: [schema.MedicalCondition] }, env)
