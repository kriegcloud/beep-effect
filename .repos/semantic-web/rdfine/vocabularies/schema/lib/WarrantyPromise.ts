import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface WarrantyPromise<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  durationOfWarranty: Schema.QuantitativeValue<D> | undefined;
  warrantyScope: Schema.WarrantyScope | undefined;
}

export function WarrantyPromiseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WarrantyPromise & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WarrantyPromiseClass extends StructuredValueMixin(Resource) {
    @rdfine.property.resource()
    durationOfWarranty: Schema.QuantitativeValue | undefined;
    @rdfine.property()
    warrantyScope: Schema.WarrantyScope | undefined;
  }
  return WarrantyPromiseClass as any
}
WarrantyPromiseMixin.appliesTo = schema.WarrantyPromise
WarrantyPromiseMixin.createFactory = (env: RdfineEnvironment) => createFactory<WarrantyPromise>([StructuredValueMixin, WarrantyPromiseMixin], { types: [schema.WarrantyPromise] }, env)
