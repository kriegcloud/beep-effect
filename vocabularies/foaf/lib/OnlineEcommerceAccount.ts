import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { foaf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Foaf from '../index.js';
import { OnlineAccountMixin } from './OnlineAccount.js';

export interface OnlineEcommerceAccount<D extends RDF.DatasetCore = RDF.DatasetCore> extends Foaf.OnlineAccount<D>, rdfine.RdfResource<D> {
}

export function OnlineEcommerceAccountMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OnlineEcommerceAccount & RdfResourceCore> & Base {
  @rdfine.namespace(foaf)
  class OnlineEcommerceAccountClass extends OnlineAccountMixin(Resource) {
  }
  return OnlineEcommerceAccountClass as any
}
OnlineEcommerceAccountMixin.appliesTo = foaf.OnlineEcommerceAccount
OnlineEcommerceAccountMixin.createFactory = (env: RdfineEnvironment) => createFactory<OnlineEcommerceAccount>([OnlineAccountMixin, OnlineEcommerceAccountMixin], { types: [foaf.OnlineEcommerceAccount] }, env)
