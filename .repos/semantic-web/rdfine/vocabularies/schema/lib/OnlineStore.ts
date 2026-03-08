import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OnlineBusinessMixin } from './OnlineBusiness.js';

export interface OnlineStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.OnlineBusiness<D>, rdfine.RdfResource<D> {
}

export function OnlineStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OnlineStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OnlineStoreClass extends OnlineBusinessMixin(Resource) {
  }
  return OnlineStoreClass as any
}
OnlineStoreMixin.appliesTo = schema.OnlineStore
OnlineStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<OnlineStore>([OnlineBusinessMixin, OnlineStoreMixin], { types: [schema.OnlineStore] }, env)
