import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AutomotiveBusinessMixin } from './AutomotiveBusiness.js';
import { StoreMixin } from './Store.js';

export interface AutoPartsStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AutomotiveBusiness<D>, Schema.Store<D>, rdfine.RdfResource<D> {
}

export function AutoPartsStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AutoPartsStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AutoPartsStoreClass extends StoreMixin(AutomotiveBusinessMixin(Resource)) {
  }
  return AutoPartsStoreClass as any
}
AutoPartsStoreMixin.appliesTo = schema.AutoPartsStore
AutoPartsStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<AutoPartsStore>([StoreMixin, AutomotiveBusinessMixin, AutoPartsStoreMixin], { types: [schema.AutoPartsStore] }, env)
