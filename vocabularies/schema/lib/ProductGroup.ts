import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ProductMixin } from './Product.js';

export interface ProductGroup<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Product<D>, rdfine.RdfResource<D> {
  hasVariant: Schema.Product<D> | undefined;
  productGroupID: string | undefined;
  variesBy: string | undefined;
}

export function ProductGroupMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ProductGroup & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ProductGroupClass extends ProductMixin(Resource) {
    @rdfine.property.resource()
    hasVariant: Schema.Product | undefined;
    @rdfine.property.literal()
    productGroupID: string | undefined;
    @rdfine.property.literal()
    variesBy: string | undefined;
  }
  return ProductGroupClass as any
}
ProductGroupMixin.appliesTo = schema.ProductGroup
ProductGroupMixin.createFactory = (env: RdfineEnvironment) => createFactory<ProductGroup>([ProductMixin, ProductGroupMixin], { types: [schema.ProductGroup] }, env)
