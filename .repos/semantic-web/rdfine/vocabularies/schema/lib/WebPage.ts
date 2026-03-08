import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface WebPage<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  breadcrumb: Schema.BreadcrumbList<D> | undefined;
  breadcrumbLiteral: string | undefined;
  lastReviewed: Date | undefined;
  mainContentOfPage: Schema.WebPageElement<D> | undefined;
  primaryImageOfPage: Schema.ImageObject<D> | undefined;
  relatedLink: RDF.NamedNode | undefined;
  reviewedBy: Schema.Organization<D> | Schema.Person<D> | undefined;
  significantLink: RDF.NamedNode | undefined;
  significantLinks: RDF.NamedNode | undefined;
  speakable: Schema.SpeakableSpecification<D> | undefined;
  specialty: Schema.Specialty | undefined;
}

export function WebPageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WebPage & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WebPageClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    breadcrumb: Schema.BreadcrumbList | undefined;
    @rdfine.property.literal({ path: schema.breadcrumb })
    breadcrumbLiteral: string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    lastReviewed: Date | undefined;
    @rdfine.property.resource()
    mainContentOfPage: Schema.WebPageElement | undefined;
    @rdfine.property.resource()
    primaryImageOfPage: Schema.ImageObject | undefined;
    @rdfine.property()
    relatedLink: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    reviewedBy: Schema.Organization | Schema.Person | undefined;
    @rdfine.property()
    significantLink: RDF.NamedNode | undefined;
    @rdfine.property()
    significantLinks: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    speakable: Schema.SpeakableSpecification | undefined;
    @rdfine.property()
    specialty: Schema.Specialty | undefined;
  }
  return WebPageClass as any
}
WebPageMixin.appliesTo = schema.WebPage
WebPageMixin.createFactory = (env: RdfineEnvironment) => createFactory<WebPage>([CreativeWorkMixin, WebPageMixin], { types: [schema.WebPage] }, env)
