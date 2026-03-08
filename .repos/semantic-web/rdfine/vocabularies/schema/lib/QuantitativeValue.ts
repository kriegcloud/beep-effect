import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface QuantitativeValue<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  additionalProperty: Schema.PropertyValue<D> | undefined;
  maxValue: number | undefined;
  minValue: number | undefined;
  unitCode: string | undefined;
  unitCodeTerm: RDF.NamedNode | undefined;
  unitText: string | undefined;
  value: Schema.StructuredValue<D> | undefined;
  valueLiteral: boolean | number | string | undefined;
  valueReference: Schema.PropertyValue<D> | Schema.QuantitativeValue<D> | Schema.StructuredValue<D> | undefined;
  valueReferenceLiteral: string | undefined;
}

export function QuantitativeValueMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<QuantitativeValue & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class QuantitativeValueClass extends StructuredValueMixin(Resource) {
    @rdfine.property.resource()
    additionalProperty: Schema.PropertyValue | undefined;
    @rdfine.property.literal({ type: Number })
    maxValue: number | undefined;
    @rdfine.property.literal({ type: Number })
    minValue: number | undefined;
    @rdfine.property.literal()
    unitCode: string | undefined;
    @rdfine.property({ path: schema.unitCode })
    unitCodeTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    unitText: string | undefined;
    @rdfine.property.resource()
    value: Schema.StructuredValue | undefined;
    @rdfine.property.literal({ path: schema.value })
    valueLiteral: boolean | number | string | undefined;
    @rdfine.property.resource()
    valueReference: Schema.PropertyValue | Schema.QuantitativeValue | Schema.StructuredValue | undefined;
    @rdfine.property.literal({ path: schema.valueReference })
    valueReferenceLiteral: string | undefined;
  }
  return QuantitativeValueClass as any
}
QuantitativeValueMixin.appliesTo = schema.QuantitativeValue
QuantitativeValueMixin.createFactory = (env: RdfineEnvironment) => createFactory<QuantitativeValue>([StructuredValueMixin, QuantitativeValueMixin], { types: [schema.QuantitativeValue] }, env)
