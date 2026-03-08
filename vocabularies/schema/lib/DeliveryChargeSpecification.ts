import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PriceSpecificationMixin } from './PriceSpecification.js';

export interface DeliveryChargeSpecification<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PriceSpecification<D>, rdfine.RdfResource<D> {
  appliesToDeliveryMethod: Schema.DeliveryMethod | undefined;
  areaServed: Schema.AdministrativeArea<D> | Schema.GeoShape<D> | Schema.Place<D> | undefined;
  areaServedLiteral: string | undefined;
  eligibleRegion: Schema.GeoShape<D> | Schema.Place<D> | undefined;
  eligibleRegionLiteral: string | undefined;
  ineligibleRegion: Schema.GeoShape<D> | Schema.Place<D> | undefined;
  ineligibleRegionLiteral: string | undefined;
}

export function DeliveryChargeSpecificationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DeliveryChargeSpecification & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DeliveryChargeSpecificationClass extends PriceSpecificationMixin(Resource) {
    @rdfine.property()
    appliesToDeliveryMethod: Schema.DeliveryMethod | undefined;
    @rdfine.property.resource()
    areaServed: Schema.AdministrativeArea | Schema.GeoShape | Schema.Place | undefined;
    @rdfine.property.literal({ path: schema.areaServed })
    areaServedLiteral: string | undefined;
    @rdfine.property.resource()
    eligibleRegion: Schema.GeoShape | Schema.Place | undefined;
    @rdfine.property.literal({ path: schema.eligibleRegion })
    eligibleRegionLiteral: string | undefined;
    @rdfine.property.resource()
    ineligibleRegion: Schema.GeoShape | Schema.Place | undefined;
    @rdfine.property.literal({ path: schema.ineligibleRegion })
    ineligibleRegionLiteral: string | undefined;
  }
  return DeliveryChargeSpecificationClass as any
}
DeliveryChargeSpecificationMixin.appliesTo = schema.DeliveryChargeSpecification
DeliveryChargeSpecificationMixin.createFactory = (env: RdfineEnvironment) => createFactory<DeliveryChargeSpecification>([PriceSpecificationMixin, DeliveryChargeSpecificationMixin], { types: [schema.DeliveryChargeSpecification] }, env)
