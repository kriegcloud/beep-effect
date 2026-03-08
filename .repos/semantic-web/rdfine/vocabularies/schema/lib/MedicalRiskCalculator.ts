import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalRiskEstimatorMixin } from './MedicalRiskEstimator.js';

export interface MedicalRiskCalculator<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalRiskEstimator<D>, rdfine.RdfResource<D> {
}

export function MedicalRiskCalculatorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalRiskCalculator & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalRiskCalculatorClass extends MedicalRiskEstimatorMixin(Resource) {
  }
  return MedicalRiskCalculatorClass as any
}
MedicalRiskCalculatorMixin.appliesTo = schema.MedicalRiskCalculator
MedicalRiskCalculatorMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalRiskCalculator>([MedicalRiskEstimatorMixin, MedicalRiskCalculatorMixin], { types: [schema.MedicalRiskCalculator] }, env)
