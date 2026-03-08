import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { OfferMixin } from './Offer.js';

export interface Invite<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Offer<D>, rdfine.RdfResource<D> {
}

export function InviteMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Invite & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class InviteClass extends OfferMixin(Resource) {
  }
  return InviteClass as any
}
InviteMixin.appliesTo = as.Invite
InviteMixin.createFactory = (env: RdfineEnvironment) => createFactory<Invite>([OfferMixin, InviteMixin], { types: [as.Invite] }, env)
