import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface Store<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function StoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Store & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class StoreClass extends LocalBusinessMixin(Resource) {
  }
  return StoreClass as any
}
StoreMixin.appliesTo = schema.Store
StoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<Store>([LocalBusinessMixin, StoreMixin], { types: [schema.Store] }, env)
