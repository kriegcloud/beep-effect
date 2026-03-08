import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface HealthPlanCostSharingSpecification<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  healthPlanCoinsuranceOption: string | undefined;
  healthPlanCoinsuranceRate: number | undefined;
  healthPlanCopay: Schema.PriceSpecification<D> | undefined;
  healthPlanCopayOption: string | undefined;
  healthPlanPharmacyCategory: string | undefined;
}

export function HealthPlanCostSharingSpecificationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HealthPlanCostSharingSpecification & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HealthPlanCostSharingSpecificationClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal()
    healthPlanCoinsuranceOption: string | undefined;
    @rdfine.property.literal({ type: Number })
    healthPlanCoinsuranceRate: number | undefined;
    @rdfine.property.resource()
    healthPlanCopay: Schema.PriceSpecification | undefined;
    @rdfine.property.literal()
    healthPlanCopayOption: string | undefined;
    @rdfine.property.literal()
    healthPlanPharmacyCategory: string | undefined;
  }
  return HealthPlanCostSharingSpecificationClass as any
}
HealthPlanCostSharingSpecificationMixin.appliesTo = schema.HealthPlanCostSharingSpecification
HealthPlanCostSharingSpecificationMixin.createFactory = (env: RdfineEnvironment) => createFactory<HealthPlanCostSharingSpecification>([IntangibleMixin, HealthPlanCostSharingSpecificationMixin], { types: [schema.HealthPlanCostSharingSpecification] }, env)
