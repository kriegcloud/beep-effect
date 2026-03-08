import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface PawnShop<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function PawnShopMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PawnShop & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PawnShopClass extends StoreMixin(Resource) {
  }
  return PawnShopClass as any
}
PawnShopMixin.appliesTo = schema.PawnShop
PawnShopMixin.createFactory = (env: RdfineEnvironment) => createFactory<PawnShop>([StoreMixin, PawnShopMixin], { types: [schema.PawnShop] }, env)
