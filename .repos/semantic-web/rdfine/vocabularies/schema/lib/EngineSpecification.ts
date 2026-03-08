import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface EngineSpecification<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  engineDisplacement: Schema.QuantitativeValue<D> | undefined;
  enginePower: Schema.QuantitativeValue<D> | undefined;
  engineType: string | undefined;
  engineTypeTerm: RDF.NamedNode | Schema.QualitativeValue | undefined;
  fuelType: string | undefined;
  fuelTypeTerm: RDF.NamedNode | Schema.QualitativeValue | undefined;
  torque: Schema.QuantitativeValue<D> | undefined;
}

export function EngineSpecificationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EngineSpecification & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EngineSpecificationClass extends StructuredValueMixin(Resource) {
    @rdfine.property.resource()
    engineDisplacement: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    enginePower: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal()
    engineType: string | undefined;
    @rdfine.property({ path: schema.engineType })
    engineTypeTerm: RDF.NamedNode | Schema.QualitativeValue | undefined;
    @rdfine.property.literal()
    fuelType: string | undefined;
    @rdfine.property({ path: schema.fuelType })
    fuelTypeTerm: RDF.NamedNode | Schema.QualitativeValue | undefined;
    @rdfine.property.resource()
    torque: Schema.QuantitativeValue | undefined;
  }
  return EngineSpecificationClass as any
}
EngineSpecificationMixin.appliesTo = schema.EngineSpecification
EngineSpecificationMixin.createFactory = (env: RdfineEnvironment) => createFactory<EngineSpecification>([StructuredValueMixin, EngineSpecificationMixin], { types: [schema.EngineSpecification] }, env)
