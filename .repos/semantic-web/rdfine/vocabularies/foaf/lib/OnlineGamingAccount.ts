import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { foaf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Foaf from '../index.js';
import { OnlineAccountMixin } from './OnlineAccount.js';

export interface OnlineGamingAccount<D extends RDF.DatasetCore = RDF.DatasetCore> extends Foaf.OnlineAccount<D>, rdfine.RdfResource<D> {
}

export function OnlineGamingAccountMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OnlineGamingAccount & RdfResourceCore> & Base {
  @rdfine.namespace(foaf)
  class OnlineGamingAccountClass extends OnlineAccountMixin(Resource) {
  }
  return OnlineGamingAccountClass as any
}
OnlineGamingAccountMixin.appliesTo = foaf.OnlineGamingAccount
OnlineGamingAccountMixin.createFactory = (env: RdfineEnvironment) => createFactory<OnlineGamingAccount>([OnlineAccountMixin, OnlineGamingAccountMixin], { types: [foaf.OnlineGamingAccount] }, env)
