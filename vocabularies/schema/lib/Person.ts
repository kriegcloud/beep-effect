import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ThingMixin } from './Thing.js';

export interface Person<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Thing<D>, rdfine.RdfResource<D> {
  additionalName: string | undefined;
  address: Schema.PostalAddress<D> | undefined;
  addressLiteral: string | undefined;
  affiliation: Schema.Organization<D> | undefined;
  alumniOf: Schema.EducationalOrganization<D> | Schema.Organization<D> | undefined;
  award: string | undefined;
  awards: string | undefined;
  birthDate: Date | undefined;
  birthPlace: Schema.Place<D> | undefined;
  brand: Schema.Brand<D> | Schema.Organization<D> | undefined;
  callSign: string | undefined;
  children: Schema.Person<D> | undefined;
  colleague: Schema.Person<D> | undefined;
  colleagues: Schema.Person<D> | undefined;
  contactPoint: Schema.ContactPoint<D> | undefined;
  contactPoints: Schema.ContactPoint<D> | undefined;
  deathDate: Date | undefined;
  deathPlace: Schema.Place<D> | undefined;
  duns: string | undefined;
  email: string | undefined;
  familyName: string | undefined;
  faxNumber: string | undefined;
  follows: Schema.Person<D> | undefined;
  funder: Schema.Organization<D> | Schema.Person<D> | undefined;
  funding: Schema.Grant<D> | undefined;
  gender: string | undefined;
  genderTerm: Schema.GenderType | undefined;
  givenName: string | undefined;
  globalLocationNumber: string | undefined;
  hasCredential: RDF.Term | undefined;
  hasOccupation: Schema.Occupation<D> | undefined;
  hasOfferCatalog: Schema.OfferCatalog<D> | undefined;
  hasPOS: Schema.Place<D> | undefined;
  height: Schema.Distance<D> | Schema.QuantitativeValue<D> | undefined;
  homeLocation: Schema.ContactPoint<D> | Schema.Place<D> | undefined;
  honorificPrefix: string | undefined;
  honorificSuffix: string | undefined;
  interactionStatistic: Schema.InteractionCounter<D> | undefined;
  'isicV4': string | undefined;
  jobTitle: string | undefined;
  knows: Schema.Person<D> | undefined;
  knowsAbout: Schema.Thing<D> | undefined;
  knowsAboutLiteral: string | undefined;
  knowsLanguage: Schema.Language<D> | undefined;
  knowsLanguageLiteral: string | undefined;
  makesOffer: Schema.Offer<D> | undefined;
  memberOf: Schema.Organization<D> | Schema.ProgramMembership<D> | undefined;
  naics: string | undefined;
  nationality: Schema.Country<D> | undefined;
  netWorth: Schema.MonetaryAmount<D> | Schema.PriceSpecification<D> | undefined;
  owns: Schema.OwnershipInfo<D> | Schema.Product<D> | undefined;
  parent: Schema.Person<D> | undefined;
  parents: Schema.Person<D> | undefined;
  performerIn: Schema.Event<D> | undefined;
  publishingPrinciples: Schema.CreativeWork<D> | undefined;
  relatedTo: Schema.Person<D> | undefined;
  seeks: Schema.Demand<D> | undefined;
  sibling: Schema.Person<D> | undefined;
  siblings: Schema.Person<D> | undefined;
  sponsor: Schema.Organization<D> | Schema.Person<D> | undefined;
  spouse: Schema.Person<D> | undefined;
  taxID: string | undefined;
  telephone: string | undefined;
  vatID: string | undefined;
  weight: Schema.QuantitativeValue<D> | undefined;
  workLocation: Schema.ContactPoint<D> | Schema.Place<D> | undefined;
  worksFor: Schema.Organization<D> | undefined;
}

export function PersonMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Person & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PersonClass extends ThingMixin(Resource) {
    @rdfine.property.literal()
    additionalName: string | undefined;
    @rdfine.property.resource()
    address: Schema.PostalAddress | undefined;
    @rdfine.property.literal({ path: schema.address })
    addressLiteral: string | undefined;
    @rdfine.property.resource()
    affiliation: Schema.Organization | undefined;
    @rdfine.property.resource()
    alumniOf: Schema.EducationalOrganization | Schema.Organization | undefined;
    @rdfine.property.literal()
    award: string | undefined;
    @rdfine.property.literal()
    awards: string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    birthDate: Date | undefined;
    @rdfine.property.resource()
    birthPlace: Schema.Place | undefined;
    @rdfine.property.resource()
    brand: Schema.Brand | Schema.Organization | undefined;
    @rdfine.property.literal()
    callSign: string | undefined;
    @rdfine.property.resource()
    children: Schema.Person | undefined;
    @rdfine.property.resource()
    colleague: Schema.Person | undefined;
    @rdfine.property.resource()
    colleagues: Schema.Person | undefined;
    @rdfine.property.resource()
    contactPoint: Schema.ContactPoint | undefined;
    @rdfine.property.resource()
    contactPoints: Schema.ContactPoint | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    deathDate: Date | undefined;
    @rdfine.property.resource()
    deathPlace: Schema.Place | undefined;
    @rdfine.property.literal()
    duns: string | undefined;
    @rdfine.property.literal()
    email: string | undefined;
    @rdfine.property.literal()
    familyName: string | undefined;
    @rdfine.property.literal()
    faxNumber: string | undefined;
    @rdfine.property.resource()
    follows: Schema.Person | undefined;
    @rdfine.property.resource()
    funder: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    funding: Schema.Grant | undefined;
    @rdfine.property.literal()
    gender: string | undefined;
    @rdfine.property({ path: schema.gender })
    genderTerm: Schema.GenderType | undefined;
    @rdfine.property.literal()
    givenName: string | undefined;
    @rdfine.property.literal()
    globalLocationNumber: string | undefined;
    @rdfine.property()
    hasCredential: RDF.Term | undefined;
    @rdfine.property.resource()
    hasOccupation: Schema.Occupation | undefined;
    @rdfine.property.resource()
    hasOfferCatalog: Schema.OfferCatalog | undefined;
    @rdfine.property.resource()
    hasPOS: Schema.Place | undefined;
    @rdfine.property.resource()
    height: Schema.Distance | Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    homeLocation: Schema.ContactPoint | Schema.Place | undefined;
    @rdfine.property.literal()
    honorificPrefix: string | undefined;
    @rdfine.property.literal()
    honorificSuffix: string | undefined;
    @rdfine.property.resource()
    interactionStatistic: Schema.InteractionCounter | undefined;
    @rdfine.property.literal()
    'isicV4': string | undefined;
    @rdfine.property.literal()
    jobTitle: string | undefined;
    @rdfine.property.resource()
    knows: Schema.Person | undefined;
    @rdfine.property.resource()
    knowsAbout: Schema.Thing | undefined;
    @rdfine.property.literal({ path: schema.knowsAbout })
    knowsAboutLiteral: string | undefined;
    @rdfine.property.resource()
    knowsLanguage: Schema.Language | undefined;
    @rdfine.property.literal({ path: schema.knowsLanguage })
    knowsLanguageLiteral: string | undefined;
    @rdfine.property.resource()
    makesOffer: Schema.Offer | undefined;
    @rdfine.property.resource()
    memberOf: Schema.Organization | Schema.ProgramMembership | undefined;
    @rdfine.property.literal()
    naics: string | undefined;
    @rdfine.property.resource()
    nationality: Schema.Country | undefined;
    @rdfine.property.resource()
    netWorth: Schema.MonetaryAmount | Schema.PriceSpecification | undefined;
    @rdfine.property.resource()
    owns: Schema.OwnershipInfo | Schema.Product | undefined;
    @rdfine.property.resource()
    parent: Schema.Person | undefined;
    @rdfine.property.resource()
    parents: Schema.Person | undefined;
    @rdfine.property.resource()
    performerIn: Schema.Event | undefined;
    @rdfine.property.resource()
    publishingPrinciples: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    relatedTo: Schema.Person | undefined;
    @rdfine.property.resource()
    seeks: Schema.Demand | undefined;
    @rdfine.property.resource()
    sibling: Schema.Person | undefined;
    @rdfine.property.resource()
    siblings: Schema.Person | undefined;
    @rdfine.property.resource()
    sponsor: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    spouse: Schema.Person | undefined;
    @rdfine.property.literal()
    taxID: string | undefined;
    @rdfine.property.literal()
    telephone: string | undefined;
    @rdfine.property.literal()
    vatID: string | undefined;
    @rdfine.property.resource()
    weight: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    workLocation: Schema.ContactPoint | Schema.Place | undefined;
    @rdfine.property.resource()
    worksFor: Schema.Organization | undefined;
  }
  return PersonClass as any
}
PersonMixin.appliesTo = schema.Person
PersonMixin.createFactory = (env: RdfineEnvironment) => createFactory<Person>([ThingMixin, PersonMixin], { types: [schema.Person] }, env)
