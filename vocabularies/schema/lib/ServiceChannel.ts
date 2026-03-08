import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface ServiceChannel<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  availableLanguage: Schema.Language<D> | undefined;
  availableLanguageLiteral: string | undefined;
  processingTime: Schema.Duration<D> | undefined;
  providesService: Schema.Service<D> | undefined;
  serviceLocation: Schema.Place<D> | undefined;
  servicePhone: Schema.ContactPoint<D> | undefined;
  servicePostalAddress: Schema.PostalAddress<D> | undefined;
  serviceSmsNumber: Schema.ContactPoint<D> | undefined;
  serviceUrl: RDF.NamedNode | undefined;
}

export function ServiceChannelMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ServiceChannel & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ServiceChannelClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    availableLanguage: Schema.Language | undefined;
    @rdfine.property.literal({ path: schema.availableLanguage })
    availableLanguageLiteral: string | undefined;
    @rdfine.property.resource()
    processingTime: Schema.Duration | undefined;
    @rdfine.property.resource()
    providesService: Schema.Service | undefined;
    @rdfine.property.resource()
    serviceLocation: Schema.Place | undefined;
    @rdfine.property.resource()
    servicePhone: Schema.ContactPoint | undefined;
    @rdfine.property.resource()
    servicePostalAddress: Schema.PostalAddress | undefined;
    @rdfine.property.resource()
    serviceSmsNumber: Schema.ContactPoint | undefined;
    @rdfine.property()
    serviceUrl: RDF.NamedNode | undefined;
  }
  return ServiceChannelClass as any
}
ServiceChannelMixin.appliesTo = schema.ServiceChannel
ServiceChannelMixin.createFactory = (env: RdfineEnvironment) => createFactory<ServiceChannel>([IntangibleMixin, ServiceChannelMixin], { types: [schema.ServiceChannel] }, env)
