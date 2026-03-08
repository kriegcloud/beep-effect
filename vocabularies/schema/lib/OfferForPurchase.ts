import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OfferMixin } from './Offer.js';

export interface OfferForPurchase<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Offer<D>, rdfine.RdfResource<D> {
}

export function OfferForPurchaseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OfferForPurchase & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OfferForPurchaseClass extends OfferMixin(Resource) {
  }
  return OfferForPurchaseClass as any
}
OfferForPurchaseMixin.appliesTo = schema.OfferForPurchase
OfferForPurchaseMixin.createFactory = (env: RdfineEnvironment) => createFactory<OfferForPurchase>([OfferMixin, OfferForPurchaseMixin], { types: [schema.OfferForPurchase] }, env)
