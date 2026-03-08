import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ProductMixin } from './Product.js';

export interface SomeProducts<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Product<D>, rdfine.RdfResource<D> {
  inventoryLevel: Schema.QuantitativeValue<D> | undefined;
}

export function SomeProductsMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SomeProducts & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SomeProductsClass extends ProductMixin(Resource) {
    @rdfine.property.resource()
    inventoryLevel: Schema.QuantitativeValue | undefined;
  }
  return SomeProductsClass as any
}
SomeProductsMixin.appliesTo = schema.SomeProducts
SomeProductsMixin.createFactory = (env: RdfineEnvironment) => createFactory<SomeProducts>([ProductMixin, SomeProductsMixin], { types: [schema.SomeProducts] }, env)
