import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ProductMixin } from './Product.js';
import { SubstanceMixin } from './Substance.js';

export interface DietarySupplement<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Product<D>, Schema.Substance<D>, rdfine.RdfResource<D> {
  activeIngredient: string | undefined;
  isProprietary: boolean | undefined;
  legalStatus: Schema.DrugLegalStatus<D> | undefined;
  legalStatusLiteral: string | undefined;
  maximumIntake: Schema.MaximumDoseSchedule<D> | undefined;
  mechanismOfAction: string | undefined;
  nonProprietaryName: string | undefined;
  proprietaryName: string | undefined;
  recommendedIntake: Schema.RecommendedDoseSchedule<D> | undefined;
  safetyConsideration: string | undefined;
  targetPopulation: string | undefined;
}

export function DietarySupplementMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DietarySupplement & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DietarySupplementClass extends SubstanceMixin(ProductMixin(Resource)) {
    @rdfine.property.literal()
    activeIngredient: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    isProprietary: boolean | undefined;
    @rdfine.property.resource()
    legalStatus: Schema.DrugLegalStatus | undefined;
    @rdfine.property.literal({ path: schema.legalStatus })
    legalStatusLiteral: string | undefined;
    @rdfine.property.resource()
    maximumIntake: Schema.MaximumDoseSchedule | undefined;
    @rdfine.property.literal()
    mechanismOfAction: string | undefined;
    @rdfine.property.literal()
    nonProprietaryName: string | undefined;
    @rdfine.property.literal()
    proprietaryName: string | undefined;
    @rdfine.property.resource()
    recommendedIntake: Schema.RecommendedDoseSchedule | undefined;
    @rdfine.property.literal()
    safetyConsideration: string | undefined;
    @rdfine.property.literal()
    targetPopulation: string | undefined;
  }
  return DietarySupplementClass as any
}
DietarySupplementMixin.appliesTo = schema.DietarySupplement
DietarySupplementMixin.createFactory = (env: RdfineEnvironment) => createFactory<DietarySupplement>([SubstanceMixin, ProductMixin, DietarySupplementMixin], { types: [schema.DietarySupplement] }, env)
