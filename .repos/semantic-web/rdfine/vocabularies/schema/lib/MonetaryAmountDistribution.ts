import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { QuantitativeValueDistributionMixin } from './QuantitativeValueDistribution.js';

export interface MonetaryAmountDistribution<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.QuantitativeValueDistribution<D>, rdfine.RdfResource<D> {
  currency: string | undefined;
}

export function MonetaryAmountDistributionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MonetaryAmountDistribution & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MonetaryAmountDistributionClass extends QuantitativeValueDistributionMixin(Resource) {
    @rdfine.property.literal()
    currency: string | undefined;
  }
  return MonetaryAmountDistributionClass as any
}
MonetaryAmountDistributionMixin.appliesTo = schema.MonetaryAmountDistribution
MonetaryAmountDistributionMixin.createFactory = (env: RdfineEnvironment) => createFactory<MonetaryAmountDistribution>([QuantitativeValueDistributionMixin, MonetaryAmountDistributionMixin], { types: [schema.MonetaryAmountDistribution] }, env)
