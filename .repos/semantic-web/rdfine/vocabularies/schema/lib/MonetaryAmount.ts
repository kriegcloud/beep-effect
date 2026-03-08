import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface MonetaryAmount<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  currency: string | undefined;
  maxValue: number | undefined;
  minValue: number | undefined;
  validFrom: Date | undefined;
  validThrough: Date | undefined;
  value: Schema.StructuredValue<D> | undefined;
  valueLiteral: boolean | number | string | undefined;
}

export function MonetaryAmountMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MonetaryAmount & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MonetaryAmountClass extends StructuredValueMixin(Resource) {
    @rdfine.property.literal()
    currency: string | undefined;
    @rdfine.property.literal({ type: Number })
    maxValue: number | undefined;
    @rdfine.property.literal({ type: Number })
    minValue: number | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    validFrom: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    validThrough: Date | undefined;
    @rdfine.property.resource()
    value: Schema.StructuredValue | undefined;
    @rdfine.property.literal({ path: schema.value })
    valueLiteral: boolean | number | string | undefined;
  }
  return MonetaryAmountClass as any
}
MonetaryAmountMixin.appliesTo = schema.MonetaryAmount
MonetaryAmountMixin.createFactory = (env: RdfineEnvironment) => createFactory<MonetaryAmount>([StructuredValueMixin, MonetaryAmountMixin], { types: [schema.MonetaryAmount] }, env)
