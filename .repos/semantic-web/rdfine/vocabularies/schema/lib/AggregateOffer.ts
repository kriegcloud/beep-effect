import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OfferMixin } from './Offer.js';

export interface AggregateOffer<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Offer<D>, rdfine.RdfResource<D> {
  highPrice: number | string | undefined;
  lowPrice: number | string | undefined;
  offerCount: number | undefined;
  offers: Schema.Demand<D> | Schema.Offer<D> | undefined;
}

export function AggregateOfferMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AggregateOffer & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AggregateOfferClass extends OfferMixin(Resource) {
    @rdfine.property.literal()
    highPrice: number | string | undefined;
    @rdfine.property.literal()
    lowPrice: number | string | undefined;
    @rdfine.property.literal({ type: Number })
    offerCount: number | undefined;
    @rdfine.property.resource()
    offers: Schema.Demand | Schema.Offer | undefined;
  }
  return AggregateOfferClass as any
}
AggregateOfferMixin.appliesTo = schema.AggregateOffer
AggregateOfferMixin.createFactory = (env: RdfineEnvironment) => createFactory<AggregateOffer>([OfferMixin, AggregateOfferMixin], { types: [schema.AggregateOffer] }, env)
