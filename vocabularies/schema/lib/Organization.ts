import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ThingMixin } from './Thing.js';

export interface Organization<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Thing<D>, rdfine.RdfResource<D> {
  actionableFeedbackPolicy: Schema.CreativeWork<D> | undefined;
  address: Schema.PostalAddress<D> | undefined;
  addressLiteral: string | undefined;
  aggregateRating: Schema.AggregateRating<D> | undefined;
  alumni: Schema.Person<D> | undefined;
  areaServed: Schema.AdministrativeArea<D> | Schema.GeoShape<D> | Schema.Place<D> | undefined;
  areaServedLiteral: string | undefined;
  award: string | undefined;
  awards: string | undefined;
  brand: Schema.Brand<D> | Schema.Organization<D> | undefined;
  contactPoint: Schema.ContactPoint<D> | undefined;
  contactPoints: Schema.ContactPoint<D> | undefined;
  correctionsPolicy: Schema.CreativeWork<D> | undefined;
  department: Schema.Organization<D> | undefined;
  dissolutionDate: Date | undefined;
  diversityPolicy: Schema.CreativeWork<D> | undefined;
  diversityStaffingReport: Schema.Article<D> | undefined;
  duns: string | undefined;
  email: string | undefined;
  employee: Schema.Person<D> | undefined;
  employees: Schema.Person<D> | undefined;
  ethicsPolicy: Schema.CreativeWork<D> | undefined;
  event: Schema.Event<D> | undefined;
  events: Schema.Event<D> | undefined;
  faxNumber: string | undefined;
  founder: Schema.Person<D> | undefined;
  founders: Schema.Person<D> | undefined;
  foundingDate: Date | undefined;
  foundingLocation: Schema.Place<D> | undefined;
  funder: Schema.Organization<D> | Schema.Person<D> | undefined;
  funding: Schema.Grant<D> | undefined;
  globalLocationNumber: string | undefined;
  hasCredential: RDF.Term | undefined;
  hasMerchantReturnPolicy: Schema.MerchantReturnPolicy<D> | undefined;
  hasOfferCatalog: Schema.OfferCatalog<D> | undefined;
  hasPOS: Schema.Place<D> | undefined;
  interactionStatistic: Schema.InteractionCounter<D> | undefined;
  'isicV4': string | undefined;
  'iso6523Code': string | undefined;
  keywords: string | undefined;
  keywordsTerm: RDF.NamedNode | undefined;
  knowsAbout: Schema.Thing<D> | undefined;
  knowsAboutLiteral: string | undefined;
  knowsLanguage: Schema.Language<D> | undefined;
  knowsLanguageLiteral: string | undefined;
  legalName: string | undefined;
  leiCode: string | undefined;
  location: Schema.Place<D> | Schema.PostalAddress<D> | undefined;
  locationLiteral: string | undefined;
  logo: Schema.ImageObject<D> | undefined;
  makesOffer: Schema.Offer<D> | undefined;
  member: Schema.Organization<D> | Schema.Person<D> | undefined;
  memberOf: Schema.Organization<D> | Schema.ProgramMembership<D> | undefined;
  members: Schema.Organization<D> | Schema.Person<D> | undefined;
  naics: string | undefined;
  nonprofitStatus: Schema.NonprofitType | undefined;
  numberOfEmployees: Schema.QuantitativeValue<D> | undefined;
  ownershipFundingInfo: Schema.AboutPage<D> | Schema.CreativeWork<D> | undefined;
  ownershipFundingInfoLiteral: string | undefined;
  owns: Schema.OwnershipInfo<D> | Schema.Product<D> | undefined;
  parentOrganization: Schema.Organization<D> | undefined;
  publishingPrinciples: Schema.CreativeWork<D> | undefined;
  review: Schema.Review<D> | undefined;
  reviews: Schema.Review<D> | undefined;
  seeks: Schema.Demand<D> | undefined;
  serviceArea: Schema.AdministrativeArea<D> | Schema.GeoShape<D> | Schema.Place<D> | undefined;
  slogan: string | undefined;
  sponsor: Schema.Organization<D> | Schema.Person<D> | undefined;
  subOrganization: Schema.Organization<D> | undefined;
  taxID: string | undefined;
  telephone: string | undefined;
  unnamedSourcesPolicy: Schema.CreativeWork<D> | undefined;
  vatID: string | undefined;
}

export function OrganizationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Organization & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OrganizationClass extends ThingMixin(Resource) {
    @rdfine.property.resource()
    actionableFeedbackPolicy: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    address: Schema.PostalAddress | undefined;
    @rdfine.property.literal({ path: schema.address })
    addressLiteral: string | undefined;
    @rdfine.property.resource()
    aggregateRating: Schema.AggregateRating | undefined;
    @rdfine.property.resource()
    alumni: Schema.Person | undefined;
    @rdfine.property.resource()
    areaServed: Schema.AdministrativeArea | Schema.GeoShape | Schema.Place | undefined;
    @rdfine.property.literal({ path: schema.areaServed })
    areaServedLiteral: string | undefined;
    @rdfine.property.literal()
    award: string | undefined;
    @rdfine.property.literal()
    awards: string | undefined;
    @rdfine.property.resource()
    brand: Schema.Brand | Schema.Organization | undefined;
    @rdfine.property.resource()
    contactPoint: Schema.ContactPoint | undefined;
    @rdfine.property.resource()
    contactPoints: Schema.ContactPoint | undefined;
    @rdfine.property.resource()
    correctionsPolicy: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    department: Schema.Organization | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    dissolutionDate: Date | undefined;
    @rdfine.property.resource()
    diversityPolicy: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    diversityStaffingReport: Schema.Article | undefined;
    @rdfine.property.literal()
    duns: string | undefined;
    @rdfine.property.literal()
    email: string | undefined;
    @rdfine.property.resource()
    employee: Schema.Person | undefined;
    @rdfine.property.resource()
    employees: Schema.Person | undefined;
    @rdfine.property.resource()
    ethicsPolicy: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    event: Schema.Event | undefined;
    @rdfine.property.resource()
    events: Schema.Event | undefined;
    @rdfine.property.literal()
    faxNumber: string | undefined;
    @rdfine.property.resource()
    founder: Schema.Person | undefined;
    @rdfine.property.resource()
    founders: Schema.Person | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    foundingDate: Date | undefined;
    @rdfine.property.resource()
    foundingLocation: Schema.Place | undefined;
    @rdfine.property.resource()
    funder: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    funding: Schema.Grant | undefined;
    @rdfine.property.literal()
    globalLocationNumber: string | undefined;
    @rdfine.property()
    hasCredential: RDF.Term | undefined;
    @rdfine.property.resource()
    hasMerchantReturnPolicy: Schema.MerchantReturnPolicy | undefined;
    @rdfine.property.resource()
    hasOfferCatalog: Schema.OfferCatalog | undefined;
    @rdfine.property.resource()
    hasPOS: Schema.Place | undefined;
    @rdfine.property.resource()
    interactionStatistic: Schema.InteractionCounter | undefined;
    @rdfine.property.literal()
    'isicV4': string | undefined;
    @rdfine.property.literal()
    'iso6523Code': string | undefined;
    @rdfine.property.literal()
    keywords: string | undefined;
    @rdfine.property({ path: schema.keywords })
    keywordsTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    knowsAbout: Schema.Thing | undefined;
    @rdfine.property.literal({ path: schema.knowsAbout })
    knowsAboutLiteral: string | undefined;
    @rdfine.property.resource()
    knowsLanguage: Schema.Language | undefined;
    @rdfine.property.literal({ path: schema.knowsLanguage })
    knowsLanguageLiteral: string | undefined;
    @rdfine.property.literal()
    legalName: string | undefined;
    @rdfine.property.literal()
    leiCode: string | undefined;
    @rdfine.property.resource()
    location: Schema.Place | Schema.PostalAddress | undefined;
    @rdfine.property.literal({ path: schema.location })
    locationLiteral: string | undefined;
    @rdfine.property.resource()
    logo: Schema.ImageObject | undefined;
    @rdfine.property.resource()
    makesOffer: Schema.Offer | undefined;
    @rdfine.property.resource()
    member: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    memberOf: Schema.Organization | Schema.ProgramMembership | undefined;
    @rdfine.property.resource()
    members: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    naics: string | undefined;
    @rdfine.property()
    nonprofitStatus: Schema.NonprofitType | undefined;
    @rdfine.property.resource()
    numberOfEmployees: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    ownershipFundingInfo: Schema.AboutPage | Schema.CreativeWork | undefined;
    @rdfine.property.literal({ path: schema.ownershipFundingInfo })
    ownershipFundingInfoLiteral: string | undefined;
    @rdfine.property.resource()
    owns: Schema.OwnershipInfo | Schema.Product | undefined;
    @rdfine.property.resource()
    parentOrganization: Schema.Organization | undefined;
    @rdfine.property.resource()
    publishingPrinciples: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    review: Schema.Review | undefined;
    @rdfine.property.resource()
    reviews: Schema.Review | undefined;
    @rdfine.property.resource()
    seeks: Schema.Demand | undefined;
    @rdfine.property.resource()
    serviceArea: Schema.AdministrativeArea | Schema.GeoShape | Schema.Place | undefined;
    @rdfine.property.literal()
    slogan: string | undefined;
    @rdfine.property.resource()
    sponsor: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    subOrganization: Schema.Organization | undefined;
    @rdfine.property.literal()
    taxID: string | undefined;
    @rdfine.property.literal()
    telephone: string | undefined;
    @rdfine.property.resource()
    unnamedSourcesPolicy: Schema.CreativeWork | undefined;
    @rdfine.property.literal()
    vatID: string | undefined;
  }
  return OrganizationClass as any
}
OrganizationMixin.appliesTo = schema.Organization
OrganizationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Organization>([ThingMixin, OrganizationMixin], { types: [schema.Organization] }, env)
