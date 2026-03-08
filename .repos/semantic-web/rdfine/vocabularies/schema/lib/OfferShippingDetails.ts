import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface OfferShippingDetails<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  deliveryTime: Schema.ShippingDeliveryTime<D> | undefined;
  depth: Schema.Distance<D> | Schema.QuantitativeValue<D> | undefined;
  doesNotShip: boolean | undefined;
  height: Schema.Distance<D> | Schema.QuantitativeValue<D> | undefined;
  shippingDestination: Schema.DefinedRegion<D> | undefined;
  shippingLabel: string | undefined;
  shippingOrigin: Schema.DefinedRegion<D> | undefined;
  shippingRate: Schema.MonetaryAmount<D> | undefined;
  shippingSettingsLink: RDF.NamedNode | undefined;
  transitTimeLabel: string | undefined;
  weight: Schema.QuantitativeValue<D> | undefined;
  width: Schema.Distance<D> | Schema.QuantitativeValue<D> | undefined;
}

export function OfferShippingDetailsMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OfferShippingDetails & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OfferShippingDetailsClass extends StructuredValueMixin(Resource) {
    @rdfine.property.resource()
    deliveryTime: Schema.ShippingDeliveryTime | undefined;
    @rdfine.property.resource()
    depth: Schema.Distance | Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ type: Boolean })
    doesNotShip: boolean | undefined;
    @rdfine.property.resource()
    height: Schema.Distance | Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    shippingDestination: Schema.DefinedRegion | undefined;
    @rdfine.property.literal()
    shippingLabel: string | undefined;
    @rdfine.property.resource()
    shippingOrigin: Schema.DefinedRegion | undefined;
    @rdfine.property.resource()
    shippingRate: Schema.MonetaryAmount | undefined;
    @rdfine.property()
    shippingSettingsLink: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    transitTimeLabel: string | undefined;
    @rdfine.property.resource()
    weight: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    width: Schema.Distance | Schema.QuantitativeValue | undefined;
  }
  return OfferShippingDetailsClass as any
}
OfferShippingDetailsMixin.appliesTo = schema.OfferShippingDetails
OfferShippingDetailsMixin.createFactory = (env: RdfineEnvironment) => createFactory<OfferShippingDetails>([StructuredValueMixin, OfferShippingDetailsMixin], { types: [schema.OfferShippingDetails] }, env)
