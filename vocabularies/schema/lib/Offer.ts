import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Offer<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  acceptedPaymentMethod: Schema.LoanOrCredit<D> | undefined;
  addOn: Schema.Offer<D> | undefined;
  advanceBookingRequirement: Schema.QuantitativeValue<D> | undefined;
  aggregateRating: Schema.AggregateRating<D> | undefined;
  areaServed: Schema.AdministrativeArea<D> | Schema.GeoShape<D> | Schema.Place<D> | undefined;
  areaServedLiteral: string | undefined;
  asin: string | undefined;
  asinTerm: RDF.NamedNode | undefined;
  availability: Schema.ItemAvailability | undefined;
  availabilityEnds: Date | undefined;
  availabilityStarts: Date | undefined;
  availableAtOrFrom: Schema.Place<D> | undefined;
  availableDeliveryMethod: Schema.DeliveryMethod | undefined;
  businessFunction: Schema.BusinessFunction | undefined;
  category: Schema.CategoryCode<D> | Schema.Thing<D> | undefined;
  categoryLiteral: string | undefined;
  checkoutPageURLTemplate: string | undefined;
  deliveryLeadTime: Schema.QuantitativeValue<D> | undefined;
  eligibleCustomerType: Schema.BusinessEntityType | undefined;
  eligibleDuration: Schema.QuantitativeValue<D> | undefined;
  eligibleQuantity: Schema.QuantitativeValue<D> | undefined;
  eligibleRegion: Schema.GeoShape<D> | Schema.Place<D> | undefined;
  eligibleRegionLiteral: string | undefined;
  eligibleTransactionVolume: Schema.PriceSpecification<D> | undefined;
  gtin: string | undefined;
  'gtin12': string | undefined;
  'gtin13': string | undefined;
  'gtin14': string | undefined;
  'gtin8': string | undefined;
  gtinTerm: RDF.NamedNode | undefined;
  hasAdultConsideration: Schema.AdultOrientedEnumeration | undefined;
  hasMeasurement: Schema.QuantitativeValue<D> | undefined;
  hasMerchantReturnPolicy: Schema.MerchantReturnPolicy<D> | undefined;
  includesObject: Schema.TypeAndQuantityNode<D> | undefined;
  ineligibleRegion: Schema.GeoShape<D> | Schema.Place<D> | undefined;
  ineligibleRegionLiteral: string | undefined;
  inventoryLevel: Schema.QuantitativeValue<D> | undefined;
  isFamilyFriendly: boolean | undefined;
  itemCondition: Schema.OfferItemCondition | undefined;
  itemOffered: Schema.AggregateOffer<D> | Schema.CreativeWork<D> | Schema.Event<D> | Schema.MenuItem<D> | Schema.Product<D> | Schema.Service<D> | Schema.Trip<D> | undefined;
  leaseLength: Schema.Duration<D> | Schema.QuantitativeValue<D> | undefined;
  mobileUrl: string | undefined;
  mpn: string | undefined;
  offeredBy: Schema.Organization<D> | Schema.Person<D> | undefined;
  price: number | string | undefined;
  priceCurrency: string | undefined;
  priceSpecification: Schema.PriceSpecification<D> | undefined;
  priceValidUntil: Date | undefined;
  review: Schema.Review<D> | undefined;
  reviews: Schema.Review<D> | undefined;
  seller: Schema.Organization<D> | Schema.Person<D> | undefined;
  serialNumber: string | undefined;
  shippingDetails: Schema.OfferShippingDetails<D> | undefined;
  sku: string | undefined;
  validFrom: Date | undefined;
  validThrough: Date | undefined;
  warranty: Schema.WarrantyPromise<D> | undefined;
}

export function OfferMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Offer & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OfferClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    acceptedPaymentMethod: Schema.LoanOrCredit | undefined;
    @rdfine.property.resource()
    addOn: Schema.Offer | undefined;
    @rdfine.property.resource()
    advanceBookingRequirement: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    aggregateRating: Schema.AggregateRating | undefined;
    @rdfine.property.resource()
    areaServed: Schema.AdministrativeArea | Schema.GeoShape | Schema.Place | undefined;
    @rdfine.property.literal({ path: schema.areaServed })
    areaServedLiteral: string | undefined;
    @rdfine.property.literal()
    asin: string | undefined;
    @rdfine.property({ path: schema.asin })
    asinTerm: RDF.NamedNode | undefined;
    @rdfine.property()
    availability: Schema.ItemAvailability | undefined;
    @rdfine.property.literal({ type: Date })
    availabilityEnds: Date | undefined;
    @rdfine.property.literal({ type: Date })
    availabilityStarts: Date | undefined;
    @rdfine.property.resource()
    availableAtOrFrom: Schema.Place | undefined;
    @rdfine.property()
    availableDeliveryMethod: Schema.DeliveryMethod | undefined;
    @rdfine.property()
    businessFunction: Schema.BusinessFunction | undefined;
    @rdfine.property.resource()
    category: Schema.CategoryCode | Schema.Thing | undefined;
    @rdfine.property.literal({ path: schema.category })
    categoryLiteral: string | undefined;
    @rdfine.property.literal()
    checkoutPageURLTemplate: string | undefined;
    @rdfine.property.resource()
    deliveryLeadTime: Schema.QuantitativeValue | undefined;
    @rdfine.property()
    eligibleCustomerType: Schema.BusinessEntityType | undefined;
    @rdfine.property.resource()
    eligibleDuration: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    eligibleQuantity: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    eligibleRegion: Schema.GeoShape | Schema.Place | undefined;
    @rdfine.property.literal({ path: schema.eligibleRegion })
    eligibleRegionLiteral: string | undefined;
    @rdfine.property.resource()
    eligibleTransactionVolume: Schema.PriceSpecification | undefined;
    @rdfine.property.literal()
    gtin: string | undefined;
    @rdfine.property.literal()
    'gtin12': string | undefined;
    @rdfine.property.literal()
    'gtin13': string | undefined;
    @rdfine.property.literal()
    'gtin14': string | undefined;
    @rdfine.property.literal()
    'gtin8': string | undefined;
    @rdfine.property({ path: schema.gtin })
    gtinTerm: RDF.NamedNode | undefined;
    @rdfine.property()
    hasAdultConsideration: Schema.AdultOrientedEnumeration | undefined;
    @rdfine.property.resource()
    hasMeasurement: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    hasMerchantReturnPolicy: Schema.MerchantReturnPolicy | undefined;
    @rdfine.property.resource()
    includesObject: Schema.TypeAndQuantityNode | undefined;
    @rdfine.property.resource()
    ineligibleRegion: Schema.GeoShape | Schema.Place | undefined;
    @rdfine.property.literal({ path: schema.ineligibleRegion })
    ineligibleRegionLiteral: string | undefined;
    @rdfine.property.resource()
    inventoryLevel: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ type: Boolean })
    isFamilyFriendly: boolean | undefined;
    @rdfine.property()
    itemCondition: Schema.OfferItemCondition | undefined;
    @rdfine.property.resource()
    itemOffered: Schema.AggregateOffer | Schema.CreativeWork | Schema.Event | Schema.MenuItem | Schema.Product | Schema.Service | Schema.Trip | undefined;
    @rdfine.property.resource()
    leaseLength: Schema.Duration | Schema.QuantitativeValue | undefined;
    @rdfine.property.literal()
    mobileUrl: string | undefined;
    @rdfine.property.literal()
    mpn: string | undefined;
    @rdfine.property.resource()
    offeredBy: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    price: number | string | undefined;
    @rdfine.property.literal()
    priceCurrency: string | undefined;
    @rdfine.property.resource()
    priceSpecification: Schema.PriceSpecification | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    priceValidUntil: Date | undefined;
    @rdfine.property.resource()
    review: Schema.Review | undefined;
    @rdfine.property.resource()
    reviews: Schema.Review | undefined;
    @rdfine.property.resource()
    seller: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    serialNumber: string | undefined;
    @rdfine.property.resource()
    shippingDetails: Schema.OfferShippingDetails | undefined;
    @rdfine.property.literal()
    sku: string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    validFrom: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    validThrough: Date | undefined;
    @rdfine.property.resource()
    warranty: Schema.WarrantyPromise | undefined;
  }
  return OfferClass as any
}
OfferMixin.appliesTo = schema.Offer
OfferMixin.createFactory = (env: RdfineEnvironment) => createFactory<Offer>([IntangibleMixin, OfferMixin], { types: [schema.Offer] }, env)
