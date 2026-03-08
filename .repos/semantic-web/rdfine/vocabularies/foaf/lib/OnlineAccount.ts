import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { foaf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Foaf from '../index.js';

export interface OnlineAccount<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  accountName: RDF.Literal | undefined;
  accountServiceHomepage: Foaf.Document<D> | undefined;
}

export function OnlineAccountMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OnlineAccount & RdfResourceCore> & Base {
  @rdfine.namespace(foaf)
  class OnlineAccountClass extends Resource {
    @rdfine.property()
    accountName: RDF.Literal | undefined;
    @rdfine.property.resource({ implicitTypes: [foaf.Document] })
    accountServiceHomepage: Foaf.Document | undefined;
  }
  return OnlineAccountClass as any
}
OnlineAccountMixin.appliesTo = foaf.OnlineAccount
OnlineAccountMixin.createFactory = (env: RdfineEnvironment) => createFactory<OnlineAccount>([OnlineAccountMixin], { types: [foaf.OnlineAccount] }, env)
