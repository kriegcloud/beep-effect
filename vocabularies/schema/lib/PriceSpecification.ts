import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface PriceSpecification<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  eligibleQuantity: Schema.QuantitativeValue<D> | undefined;
  eligibleTransactionVolume: Schema.PriceSpecification<D> | undefined;
  maxPrice: number | undefined;
  minPrice: number | undefined;
  price: number | string | undefined;
  priceCurrency: string | undefined;
  validFrom: Date | undefined;
  validThrough: Date | undefined;
  valueAddedTaxIncluded: boolean | undefined;
}

export function PriceSpecificationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PriceSpecification & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PriceSpecificationClass extends StructuredValueMixin(Resource) {
    @rdfine.property.resource()
    eligibleQuantity: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    eligibleTransactionVolume: Schema.PriceSpecification | undefined;
    @rdfine.property.literal({ type: Number })
    maxPrice: number | undefined;
    @rdfine.property.literal({ type: Number })
    minPrice: number | undefined;
    @rdfine.property.literal()
    price: number | string | undefined;
    @rdfine.property.literal()
    priceCurrency: string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    validFrom: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    validThrough: Date | undefined;
    @rdfine.property.literal({ type: Boolean })
    valueAddedTaxIncluded: boolean | undefined;
  }
  return PriceSpecificationClass as any
}
PriceSpecificationMixin.appliesTo = schema.PriceSpecification
PriceSpecificationMixin.createFactory = (env: RdfineEnvironment) => createFactory<PriceSpecification>([StructuredValueMixin, PriceSpecificationMixin], { types: [schema.PriceSpecification] }, env)
