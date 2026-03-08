import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface ParcelDelivery<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  carrier: Schema.Organization<D> | undefined;
  deliveryAddress: Schema.PostalAddress<D> | undefined;
  deliveryStatus: Schema.DeliveryEvent<D> | undefined;
  expectedArrivalFrom: Date | undefined;
  expectedArrivalUntil: Date | undefined;
  hasDeliveryMethod: Schema.DeliveryMethod | undefined;
  itemShipped: Schema.Product<D> | undefined;
  originAddress: Schema.PostalAddress<D> | undefined;
  partOfOrder: Schema.Order<D> | undefined;
  provider: Schema.Organization<D> | Schema.Person<D> | undefined;
  trackingNumber: string | undefined;
  trackingUrl: RDF.NamedNode | undefined;
}

export function ParcelDeliveryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ParcelDelivery & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ParcelDeliveryClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    carrier: Schema.Organization | undefined;
    @rdfine.property.resource()
    deliveryAddress: Schema.PostalAddress | undefined;
    @rdfine.property.resource()
    deliveryStatus: Schema.DeliveryEvent | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    expectedArrivalFrom: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    expectedArrivalUntil: Date | undefined;
    @rdfine.property()
    hasDeliveryMethod: Schema.DeliveryMethod | undefined;
    @rdfine.property.resource()
    itemShipped: Schema.Product | undefined;
    @rdfine.property.resource()
    originAddress: Schema.PostalAddress | undefined;
    @rdfine.property.resource()
    partOfOrder: Schema.Order | undefined;
    @rdfine.property.resource()
    provider: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    trackingNumber: string | undefined;
    @rdfine.property()
    trackingUrl: RDF.NamedNode | undefined;
  }
  return ParcelDeliveryClass as any
}
ParcelDeliveryMixin.appliesTo = schema.ParcelDelivery
ParcelDeliveryMixin.createFactory = (env: RdfineEnvironment) => createFactory<ParcelDelivery>([IntangibleMixin, ParcelDeliveryMixin], { types: [schema.ParcelDelivery] }, env)
