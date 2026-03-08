import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface PropertyValue<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  maxValue: number | undefined;
  measurementTechnique: string | undefined;
  measurementTechniqueTerm: RDF.NamedNode | undefined;
  minValue: number | undefined;
  propertyID: string | undefined;
  propertyIDTerm: RDF.NamedNode | undefined;
  unitCode: string | undefined;
  unitCodeTerm: RDF.NamedNode | undefined;
  unitText: string | undefined;
  value: Schema.StructuredValue<D> | undefined;
  valueLiteral: boolean | number | string | undefined;
  valueReference: Schema.PropertyValue<D> | Schema.QuantitativeValue<D> | Schema.StructuredValue<D> | undefined;
  valueReferenceLiteral: string | undefined;
}

export function PropertyValueMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PropertyValue & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PropertyValueClass extends StructuredValueMixin(Resource) {
    @rdfine.property.literal({ type: Number })
    maxValue: number | undefined;
    @rdfine.property.literal()
    measurementTechnique: string | undefined;
    @rdfine.property({ path: schema.measurementTechnique })
    measurementTechniqueTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal({ type: Number })
    minValue: number | undefined;
    @rdfine.property.literal()
    propertyID: string | undefined;
    @rdfine.property({ path: schema.propertyID })
    propertyIDTerm: RDF.NamedNode | undefined;
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
  return PropertyValueClass as any
}
PropertyValueMixin.appliesTo = schema.PropertyValue
PropertyValueMixin.createFactory = (env: RdfineEnvironment) => createFactory<PropertyValue>([StructuredValueMixin, PropertyValueMixin], { types: [schema.PropertyValue] }, env)
