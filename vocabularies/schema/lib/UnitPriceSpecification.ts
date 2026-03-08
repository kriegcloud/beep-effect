import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PriceSpecificationMixin } from './PriceSpecification.js';

export interface UnitPriceSpecification<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PriceSpecification<D>, rdfine.RdfResource<D> {
  billingDuration: Schema.Duration<D> | Schema.QuantitativeValue<D> | undefined;
  billingDurationLiteral: number | undefined;
  billingIncrement: number | undefined;
  billingStart: number | undefined;
  priceComponentType: Schema.PriceComponentTypeEnumeration | undefined;
  priceType: string | undefined;
  priceTypeTerm: Schema.PriceTypeEnumeration | undefined;
  referenceQuantity: Schema.QuantitativeValue<D> | undefined;
  unitCode: string | undefined;
  unitCodeTerm: RDF.NamedNode | undefined;
  unitText: string | undefined;
}

export function UnitPriceSpecificationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<UnitPriceSpecification & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class UnitPriceSpecificationClass extends PriceSpecificationMixin(Resource) {
    @rdfine.property.resource()
    billingDuration: Schema.Duration | Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.billingDuration, type: Number })
    billingDurationLiteral: number | undefined;
    @rdfine.property.literal({ type: Number })
    billingIncrement: number | undefined;
    @rdfine.property.literal({ type: Number })
    billingStart: number | undefined;
    @rdfine.property()
    priceComponentType: Schema.PriceComponentTypeEnumeration | undefined;
    @rdfine.property.literal()
    priceType: string | undefined;
    @rdfine.property({ path: schema.priceType })
    priceTypeTerm: Schema.PriceTypeEnumeration | undefined;
    @rdfine.property.resource()
    referenceQuantity: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal()
    unitCode: string | undefined;
    @rdfine.property({ path: schema.unitCode })
    unitCodeTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    unitText: string | undefined;
  }
  return UnitPriceSpecificationClass as any
}
UnitPriceSpecificationMixin.appliesTo = schema.UnitPriceSpecification
UnitPriceSpecificationMixin.createFactory = (env: RdfineEnvironment) => createFactory<UnitPriceSpecification>([PriceSpecificationMixin, UnitPriceSpecificationMixin], { types: [schema.UnitPriceSpecification] }, env)
