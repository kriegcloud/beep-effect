import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalGuidelineMixin } from './MedicalGuideline.js';

export interface MedicalGuidelineRecommendation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalGuideline<D>, rdfine.RdfResource<D> {
  recommendationStrength: string | undefined;
}

export function MedicalGuidelineRecommendationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalGuidelineRecommendation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalGuidelineRecommendationClass extends MedicalGuidelineMixin(Resource) {
    @rdfine.property.literal()
    recommendationStrength: string | undefined;
  }
  return MedicalGuidelineRecommendationClass as any
}
MedicalGuidelineRecommendationMixin.appliesTo = schema.MedicalGuidelineRecommendation
MedicalGuidelineRecommendationMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalGuidelineRecommendation>([MedicalGuidelineMixin, MedicalGuidelineRecommendationMixin], { types: [schema.MedicalGuidelineRecommendation] }, env)
