import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { foaf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Foaf from '../index.js';
import { OnlineAccountMixin } from './OnlineAccount.js';

export interface OnlineChatAccount<D extends RDF.DatasetCore = RDF.DatasetCore> extends Foaf.OnlineAccount<D>, rdfine.RdfResource<D> {
}

export function OnlineChatAccountMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OnlineChatAccount & RdfResourceCore> & Base {
  @rdfine.namespace(foaf)
  class OnlineChatAccountClass extends OnlineAccountMixin(Resource) {
  }
  return OnlineChatAccountClass as any
}
OnlineChatAccountMixin.appliesTo = foaf.OnlineChatAccount
OnlineChatAccountMixin.createFactory = (env: RdfineEnvironment) => createFactory<OnlineChatAccount>([OnlineAccountMixin, OnlineChatAccountMixin], { types: [foaf.OnlineChatAccount] }, env)
