import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface MedicalRiskEstimator<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
  estimatesRiskOf: Schema.MedicalEntity<D> | undefined;
  includedRiskFactor: Schema.MedicalRiskFactor<D> | undefined;
}

export function MedicalRiskEstimatorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalRiskEstimator & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalRiskEstimatorClass extends MedicalEntityMixin(Resource) {
    @rdfine.property.resource()
    estimatesRiskOf: Schema.MedicalEntity | undefined;
    @rdfine.property.resource()
    includedRiskFactor: Schema.MedicalRiskFactor | undefined;
  }
  return MedicalRiskEstimatorClass as any
}
MedicalRiskEstimatorMixin.appliesTo = schema.MedicalRiskEstimator
MedicalRiskEstimatorMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalRiskEstimator>([MedicalEntityMixin, MedicalRiskEstimatorMixin], { types: [schema.MedicalRiskEstimator] }, env)
