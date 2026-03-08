import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Service<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  aggregateRating: Schema.AggregateRating<D> | undefined;
  areaServed: Schema.AdministrativeArea<D> | Schema.GeoShape<D> | Schema.Place<D> | undefined;
  areaServedLiteral: string | undefined;
  audience: Schema.Audience<D> | undefined;
  availableChannel: Schema.ServiceChannel<D> | undefined;
  award: string | undefined;
  brand: Schema.Brand<D> | Schema.Organization<D> | undefined;
  broker: Schema.Organization<D> | Schema.Person<D> | undefined;
  category: Schema.CategoryCode<D> | Schema.Thing<D> | undefined;
  categoryLiteral: string | undefined;
  hasOfferCatalog: Schema.OfferCatalog<D> | undefined;
  hoursAvailable: Schema.OpeningHoursSpecification<D> | undefined;
  isRelatedTo: Schema.Product<D> | Schema.Service<D> | undefined;
  isSimilarTo: Schema.Product<D> | Schema.Service<D> | undefined;
  logo: Schema.ImageObject<D> | undefined;
  offers: Schema.Demand<D> | Schema.Offer<D> | undefined;
  produces: Schema.Thing<D> | undefined;
  provider: Schema.Organization<D> | Schema.Person<D> | undefined;
  providerMobility: string | undefined;
  review: Schema.Review<D> | undefined;
  serviceArea: Schema.AdministrativeArea<D> | Schema.GeoShape<D> | Schema.Place<D> | undefined;
  serviceAudience: Schema.Audience<D> | undefined;
  serviceOutput: Schema.Thing<D> | undefined;
  serviceType: string | undefined;
  serviceTypeTerm: Schema.GovernmentBenefitsType | undefined;
  slogan: string | undefined;
  termsOfService: string | undefined;
  termsOfServiceTerm: RDF.NamedNode | undefined;
}

export function ServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Service & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ServiceClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    aggregateRating: Schema.AggregateRating | undefined;
    @rdfine.property.resource()
    areaServed: Schema.AdministrativeArea | Schema.GeoShape | Schema.Place | undefined;
    @rdfine.property.literal({ path: schema.areaServed })
    areaServedLiteral: string | undefined;
    @rdfine.property.resource()
    audience: Schema.Audience | undefined;
    @rdfine.property.resource()
    availableChannel: Schema.ServiceChannel | undefined;
    @rdfine.property.literal()
    award: string | undefined;
    @rdfine.property.resource()
    brand: Schema.Brand | Schema.Organization | undefined;
    @rdfine.property.resource()
    broker: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    category: Schema.CategoryCode | Schema.Thing | undefined;
    @rdfine.property.literal({ path: schema.category })
    categoryLiteral: string | undefined;
    @rdfine.property.resource()
    hasOfferCatalog: Schema.OfferCatalog | undefined;
    @rdfine.property.resource()
    hoursAvailable: Schema.OpeningHoursSpecification | undefined;
    @rdfine.property.resource()
    isRelatedTo: Schema.Product | Schema.Service | undefined;
    @rdfine.property.resource()
    isSimilarTo: Schema.Product | Schema.Service | undefined;
    @rdfine.property.resource()
    logo: Schema.ImageObject | undefined;
    @rdfine.property.resource()
    offers: Schema.Demand | Schema.Offer | undefined;
    @rdfine.property.resource()
    produces: Schema.Thing | undefined;
    @rdfine.property.resource()
    provider: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    providerMobility: string | undefined;
    @rdfine.property.resource()
    review: Schema.Review | undefined;
    @rdfine.property.resource()
    serviceArea: Schema.AdministrativeArea | Schema.GeoShape | Schema.Place | undefined;
    @rdfine.property.resource()
    serviceAudience: Schema.Audience | undefined;
    @rdfine.property.resource()
    serviceOutput: Schema.Thing | undefined;
    @rdfine.property.literal()
    serviceType: string | undefined;
    @rdfine.property({ path: schema.serviceType })
    serviceTypeTerm: Schema.GovernmentBenefitsType | undefined;
    @rdfine.property.literal()
    slogan: string | undefined;
    @rdfine.property.literal()
    termsOfService: string | undefined;
    @rdfine.property({ path: schema.termsOfService })
    termsOfServiceTerm: RDF.NamedNode | undefined;
  }
  return ServiceClass as any
}
ServiceMixin.appliesTo = schema.Service
ServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Service>([IntangibleMixin, ServiceMixin], { types: [schema.Service] }, env)
