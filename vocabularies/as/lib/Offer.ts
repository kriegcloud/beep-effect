import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Offer<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function OfferMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Offer & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class OfferClass extends ActivityMixin(Resource) {
  }
  return OfferClass as any
}
OfferMixin.appliesTo = as.Offer
OfferMixin.createFactory = (env: RdfineEnvironment) => createFactory<Offer>([ActivityMixin, OfferMixin], { types: [as.Offer] }, env)
