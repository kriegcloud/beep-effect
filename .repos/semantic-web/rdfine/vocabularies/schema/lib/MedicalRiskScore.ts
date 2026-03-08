import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalRiskEstimatorMixin } from './MedicalRiskEstimator.js';

export interface MedicalRiskScore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalRiskEstimator<D>, rdfine.RdfResource<D> {
  algorithm: string | undefined;
}

export function MedicalRiskScoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalRiskScore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalRiskScoreClass extends MedicalRiskEstimatorMixin(Resource) {
    @rdfine.property.literal()
    algorithm: string | undefined;
  }
  return MedicalRiskScoreClass as any
}
MedicalRiskScoreMixin.appliesTo = schema.MedicalRiskScore
MedicalRiskScoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalRiskScore>([MedicalRiskEstimatorMixin, MedicalRiskScoreMixin], { types: [schema.MedicalRiskScore] }, env)
