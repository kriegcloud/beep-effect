import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CollectionMixin } from './Collection.js';
import { ProductMixin } from './Product.js';

export interface ProductCollection<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Collection<D>, Schema.Product<D>, rdfine.RdfResource<D> {
  includesObject: Schema.TypeAndQuantityNode<D> | undefined;
}

export function ProductCollectionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ProductCollection & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ProductCollectionClass extends ProductMixin(CollectionMixin(Resource)) {
    @rdfine.property.resource()
    includesObject: Schema.TypeAndQuantityNode | undefined;
  }
  return ProductCollectionClass as any
}
ProductCollectionMixin.appliesTo = schema.ProductCollection
ProductCollectionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ProductCollection>([ProductMixin, CollectionMixin, ProductCollectionMixin], { types: [schema.ProductCollection] }, env)
