import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ThingMixin } from './Thing.js';

export interface Product<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Thing<D>, rdfine.RdfResource<D> {
  additionalProperty: Schema.PropertyValue<D> | undefined;
  aggregateRating: Schema.AggregateRating<D> | undefined;
  asin: string | undefined;
  asinTerm: RDF.NamedNode | undefined;
  audience: Schema.Audience<D> | undefined;
  award: string | undefined;
  awards: string | undefined;
  brand: Schema.Brand<D> | Schema.Organization<D> | undefined;
  category: Schema.CategoryCode<D> | Schema.Thing<D> | undefined;
  categoryLiteral: string | undefined;
  color: string | undefined;
  countryOfAssembly: string | undefined;
  countryOfLastProcessing: string | undefined;
  countryOfOrigin: Schema.Country<D> | undefined;
  depth: Schema.Distance<D> | Schema.QuantitativeValue<D> | undefined;
  funding: Schema.Grant<D> | undefined;
  gtin: string | undefined;
  'gtin12': string | undefined;
  'gtin13': string | undefined;
  'gtin14': string | undefined;
  'gtin8': string | undefined;
  gtinTerm: RDF.NamedNode | undefined;
  hasAdultConsideration: Schema.AdultOrientedEnumeration | undefined;
  hasEnergyConsumptionDetails: Schema.EnergyConsumptionDetails<D> | undefined;
  hasMeasurement: Schema.QuantitativeValue<D> | undefined;
  hasMerchantReturnPolicy: Schema.MerchantReturnPolicy<D> | undefined;
  height: Schema.Distance<D> | Schema.QuantitativeValue<D> | undefined;
  inProductGroupWithID: string | undefined;
  isAccessoryOrSparePartFor: Schema.Product<D> | undefined;
  isConsumableFor: Schema.Product<D> | undefined;
  isFamilyFriendly: boolean | undefined;
  isRelatedTo: Schema.Product<D> | Schema.Service<D> | undefined;
  isSimilarTo: Schema.Product<D> | Schema.Service<D> | undefined;
  isVariantOf: Schema.ProductGroup<D> | Schema.ProductModel<D> | undefined;
  itemCondition: Schema.OfferItemCondition | undefined;
  keywords: string | undefined;
  keywordsTerm: RDF.NamedNode | undefined;
  logo: Schema.ImageObject<D> | undefined;
  manufacturer: Schema.Organization<D> | undefined;
  material: Schema.Product<D> | undefined;
  materialLiteral: string | undefined;
  mobileUrl: string | undefined;
  model: Schema.ProductModel<D> | undefined;
  modelLiteral: string | undefined;
  mpn: string | undefined;
  negativeNotes: Schema.ItemList<D> | Schema.ListItem<D> | Schema.WebContent<D> | undefined;
  negativeNotesLiteral: string | undefined;
  nsn: string | undefined;
  offers: Schema.Demand<D> | Schema.Offer<D> | undefined;
  pattern: string | undefined;
  positiveNotes: Schema.ItemList<D> | Schema.ListItem<D> | Schema.WebContent<D> | undefined;
  positiveNotesLiteral: string | undefined;
  productID: string | undefined;
  productionDate: Date | undefined;
  purchaseDate: Date | undefined;
  releaseDate: Date | undefined;
  review: Schema.Review<D> | undefined;
  reviews: Schema.Review<D> | undefined;
  size: Schema.QuantitativeValue<D> | undefined;
  sizeLiteral: string | undefined;
  sku: string | undefined;
  slogan: string | undefined;
  weight: Schema.QuantitativeValue<D> | undefined;
  width: Schema.Distance<D> | Schema.QuantitativeValue<D> | undefined;
}

export function ProductMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Product & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ProductClass extends ThingMixin(Resource) {
    @rdfine.property.resource()
    additionalProperty: Schema.PropertyValue | undefined;
    @rdfine.property.resource()
    aggregateRating: Schema.AggregateRating | undefined;
    @rdfine.property.literal()
    asin: string | undefined;
    @rdfine.property({ path: schema.asin })
    asinTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    audience: Schema.Audience | undefined;
    @rdfine.property.literal()
    award: string | undefined;
    @rdfine.property.literal()
    awards: string | undefined;
    @rdfine.property.resource()
    brand: Schema.Brand | Schema.Organization | undefined;
    @rdfine.property.resource()
    category: Schema.CategoryCode | Schema.Thing | undefined;
    @rdfine.property.literal({ path: schema.category })
    categoryLiteral: string | undefined;
    @rdfine.property.literal()
    color: string | undefined;
    @rdfine.property.literal()
    countryOfAssembly: string | undefined;
    @rdfine.property.literal()
    countryOfLastProcessing: string | undefined;
    @rdfine.property.resource()
    countryOfOrigin: Schema.Country | undefined;
    @rdfine.property.resource()
    depth: Schema.Distance | Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    funding: Schema.Grant | undefined;
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
    hasEnergyConsumptionDetails: Schema.EnergyConsumptionDetails | undefined;
    @rdfine.property.resource()
    hasMeasurement: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    hasMerchantReturnPolicy: Schema.MerchantReturnPolicy | undefined;
    @rdfine.property.resource()
    height: Schema.Distance | Schema.QuantitativeValue | undefined;
    @rdfine.property.literal()
    inProductGroupWithID: string | undefined;
    @rdfine.property.resource()
    isAccessoryOrSparePartFor: Schema.Product | undefined;
    @rdfine.property.resource()
    isConsumableFor: Schema.Product | undefined;
    @rdfine.property.literal({ type: Boolean })
    isFamilyFriendly: boolean | undefined;
    @rdfine.property.resource()
    isRelatedTo: Schema.Product | Schema.Service | undefined;
    @rdfine.property.resource()
    isSimilarTo: Schema.Product | Schema.Service | undefined;
    @rdfine.property.resource()
    isVariantOf: Schema.ProductGroup | Schema.ProductModel | undefined;
    @rdfine.property()
    itemCondition: Schema.OfferItemCondition | undefined;
    @rdfine.property.literal()
    keywords: string | undefined;
    @rdfine.property({ path: schema.keywords })
    keywordsTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    logo: Schema.ImageObject | undefined;
    @rdfine.property.resource()
    manufacturer: Schema.Organization | undefined;
    @rdfine.property.resource()
    material: Schema.Product | undefined;
    @rdfine.property.literal({ path: schema.material })
    materialLiteral: string | undefined;
    @rdfine.property.literal()
    mobileUrl: string | undefined;
    @rdfine.property.resource()
    model: Schema.ProductModel | undefined;
    @rdfine.property.literal({ path: schema.model })
    modelLiteral: string | undefined;
    @rdfine.property.literal()
    mpn: string | undefined;
    @rdfine.property.resource()
    negativeNotes: Schema.ItemList | Schema.ListItem | Schema.WebContent | undefined;
    @rdfine.property.literal({ path: schema.negativeNotes })
    negativeNotesLiteral: string | undefined;
    @rdfine.property.literal()
    nsn: string | undefined;
    @rdfine.property.resource()
    offers: Schema.Demand | Schema.Offer | undefined;
    @rdfine.property.literal()
    pattern: string | undefined;
    @rdfine.property.resource()
    positiveNotes: Schema.ItemList | Schema.ListItem | Schema.WebContent | undefined;
    @rdfine.property.literal({ path: schema.positiveNotes })
    positiveNotesLiteral: string | undefined;
    @rdfine.property.literal()
    productID: string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    productionDate: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    purchaseDate: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    releaseDate: Date | undefined;
    @rdfine.property.resource()
    review: Schema.Review | undefined;
    @rdfine.property.resource()
    reviews: Schema.Review | undefined;
    @rdfine.property.resource()
    size: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.size })
    sizeLiteral: string | undefined;
    @rdfine.property.literal()
    sku: string | undefined;
    @rdfine.property.literal()
    slogan: string | undefined;
    @rdfine.property.resource()
    weight: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    width: Schema.Distance | Schema.QuantitativeValue | undefined;
  }
  return ProductClass as any
}
ProductMixin.appliesTo = schema.Product
ProductMixin.createFactory = (env: RdfineEnvironment) => createFactory<Product>([ThingMixin, ProductMixin], { types: [schema.Product] }, env)
