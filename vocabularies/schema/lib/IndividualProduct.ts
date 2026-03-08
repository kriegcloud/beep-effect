import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ProductMixin } from './Product.js';

export interface IndividualProduct<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Product<D>, rdfine.RdfResource<D> {
  serialNumber: string | undefined;
}

export function IndividualProductMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<IndividualProduct & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class IndividualProductClass extends ProductMixin(Resource) {
    @rdfine.property.literal()
    serialNumber: string | undefined;
  }
  return IndividualProductClass as any
}
IndividualProductMixin.appliesTo = schema.IndividualProduct
IndividualProductMixin.createFactory = (env: RdfineEnvironment) => createFactory<IndividualProduct>([ProductMixin, IndividualProductMixin], { types: [schema.IndividualProduct] }, env)
