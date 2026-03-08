import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface QuantitativeValueDistribution<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  duration: Schema.Duration<D> | undefined;
  median: number | undefined;
  'percentile10': number | undefined;
  'percentile25': number | undefined;
  'percentile75': number | undefined;
  'percentile90': number | undefined;
}

export function QuantitativeValueDistributionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<QuantitativeValueDistribution & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class QuantitativeValueDistributionClass extends StructuredValueMixin(Resource) {
    @rdfine.property.resource()
    duration: Schema.Duration | undefined;
    @rdfine.property.literal({ type: Number })
    median: number | undefined;
    @rdfine.property.literal({ type: Number })
    'percentile10': number | undefined;
    @rdfine.property.literal({ type: Number })
    'percentile25': number | undefined;
    @rdfine.property.literal({ type: Number })
    'percentile75': number | undefined;
    @rdfine.property.literal({ type: Number })
    'percentile90': number | undefined;
  }
  return QuantitativeValueDistributionClass as any
}
QuantitativeValueDistributionMixin.appliesTo = schema.QuantitativeValueDistribution
QuantitativeValueDistributionMixin.createFactory = (env: RdfineEnvironment) => createFactory<QuantitativeValueDistribution>([StructuredValueMixin, QuantitativeValueDistributionMixin], { types: [schema.QuantitativeValueDistribution] }, env)
