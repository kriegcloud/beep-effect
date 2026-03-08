import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OfferMixin } from './Offer.js';

export interface OfferForLease<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Offer<D>, rdfine.RdfResource<D> {
}

export function OfferForLeaseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OfferForLease & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OfferForLeaseClass extends OfferMixin(Resource) {
  }
  return OfferForLeaseClass as any
}
OfferForLeaseMixin.appliesTo = schema.OfferForLease
OfferForLeaseMixin.createFactory = (env: RdfineEnvironment) => createFactory<OfferForLease>([OfferMixin, OfferForLeaseMixin], { types: [schema.OfferForLease] }, env)
