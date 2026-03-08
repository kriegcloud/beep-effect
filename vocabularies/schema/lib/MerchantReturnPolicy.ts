import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface MerchantReturnPolicy<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  additionalProperty: Schema.PropertyValue<D> | undefined;
  applicableCountry: Schema.Country<D> | undefined;
  applicableCountryLiteral: string | undefined;
  customerRemorseReturnFees: Schema.ReturnFeesEnumeration | undefined;
  customerRemorseReturnLabelSource: Schema.ReturnLabelSourceEnumeration | undefined;
  customerRemorseReturnShippingFeesAmount: Schema.MonetaryAmount<D> | undefined;
  inStoreReturnsOffered: boolean | undefined;
  itemCondition: Schema.OfferItemCondition | undefined;
  itemDefectReturnFees: Schema.ReturnFeesEnumeration | undefined;
  itemDefectReturnLabelSource: Schema.ReturnLabelSourceEnumeration | undefined;
  itemDefectReturnShippingFeesAmount: Schema.MonetaryAmount<D> | undefined;
  merchantReturnDays: Date | number | undefined;
  merchantReturnLink: RDF.NamedNode | undefined;
  refundType: Schema.RefundTypeEnumeration | undefined;
  restockingFee: Schema.MonetaryAmount<D> | undefined;
  restockingFeeLiteral: number | undefined;
  returnFees: Schema.ReturnFeesEnumeration | undefined;
  returnLabelSource: Schema.ReturnLabelSourceEnumeration | undefined;
  returnMethod: Schema.ReturnMethodEnumeration | undefined;
  returnPolicyCategory: Schema.MerchantReturnEnumeration | undefined;
  returnPolicyCountry: Schema.Country<D> | undefined;
  returnPolicyCountryLiteral: string | undefined;
  returnPolicySeasonalOverride: Schema.MerchantReturnPolicySeasonalOverride<D> | undefined;
  returnShippingFeesAmount: Schema.MonetaryAmount<D> | undefined;
}

export function MerchantReturnPolicyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MerchantReturnPolicy & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MerchantReturnPolicyClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    additionalProperty: Schema.PropertyValue | undefined;
    @rdfine.property.resource()
    applicableCountry: Schema.Country | undefined;
    @rdfine.property.literal({ path: schema.applicableCountry })
    applicableCountryLiteral: string | undefined;
    @rdfine.property()
    customerRemorseReturnFees: Schema.ReturnFeesEnumeration | undefined;
    @rdfine.property()
    customerRemorseReturnLabelSource: Schema.ReturnLabelSourceEnumeration | undefined;
    @rdfine.property.resource()
    customerRemorseReturnShippingFeesAmount: Schema.MonetaryAmount | undefined;
    @rdfine.property.literal({ type: Boolean })
    inStoreReturnsOffered: boolean | undefined;
    @rdfine.property()
    itemCondition: Schema.OfferItemCondition | undefined;
    @rdfine.property()
    itemDefectReturnFees: Schema.ReturnFeesEnumeration | undefined;
    @rdfine.property()
    itemDefectReturnLabelSource: Schema.ReturnLabelSourceEnumeration | undefined;
    @rdfine.property.resource()
    itemDefectReturnShippingFeesAmount: Schema.MonetaryAmount | undefined;
    @rdfine.property.literal({ datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    merchantReturnDays: Date | number | undefined;
    @rdfine.property()
    merchantReturnLink: RDF.NamedNode | undefined;
    @rdfine.property()
    refundType: Schema.RefundTypeEnumeration | undefined;
    @rdfine.property.resource()
    restockingFee: Schema.MonetaryAmount | undefined;
    @rdfine.property.literal({ path: schema.restockingFee, type: Number })
    restockingFeeLiteral: number | undefined;
    @rdfine.property()
    returnFees: Schema.ReturnFeesEnumeration | undefined;
    @rdfine.property()
    returnLabelSource: Schema.ReturnLabelSourceEnumeration | undefined;
    @rdfine.property()
    returnMethod: Schema.ReturnMethodEnumeration | undefined;
    @rdfine.property()
    returnPolicyCategory: Schema.MerchantReturnEnumeration | undefined;
    @rdfine.property.resource()
    returnPolicyCountry: Schema.Country | undefined;
    @rdfine.property.literal({ path: schema.returnPolicyCountry })
    returnPolicyCountryLiteral: string | undefined;
    @rdfine.property.resource()
    returnPolicySeasonalOverride: Schema.MerchantReturnPolicySeasonalOverride | undefined;
    @rdfine.property.resource()
    returnShippingFeesAmount: Schema.MonetaryAmount | undefined;
  }
  return MerchantReturnPolicyClass as any
}
MerchantReturnPolicyMixin.appliesTo = schema.MerchantReturnPolicy
MerchantReturnPolicyMixin.createFactory = (env: RdfineEnvironment) => createFactory<MerchantReturnPolicy>([IntangibleMixin, MerchantReturnPolicyMixin], { types: [schema.MerchantReturnPolicy] }, env)
