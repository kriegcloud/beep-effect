import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface ShoppingCenter<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function ShoppingCenterMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ShoppingCenter & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ShoppingCenterClass extends LocalBusinessMixin(Resource) {
  }
  return ShoppingCenterClass as any
}
ShoppingCenterMixin.appliesTo = schema.ShoppingCenter
ShoppingCenterMixin.createFactory = (env: RdfineEnvironment) => createFactory<ShoppingCenter>([LocalBusinessMixin, ShoppingCenterMixin], { types: [schema.ShoppingCenter] }, env)
