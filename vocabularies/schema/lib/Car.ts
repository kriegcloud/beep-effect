import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { VehicleMixin } from './Vehicle.js';

export interface Car<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Vehicle<D>, rdfine.RdfResource<D> {
  acrissCode: string | undefined;
  roofLoad: Schema.QuantitativeValue<D> | undefined;
}

export function CarMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Car & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CarClass extends VehicleMixin(Resource) {
    @rdfine.property.literal()
    acrissCode: string | undefined;
    @rdfine.property.resource()
    roofLoad: Schema.QuantitativeValue | undefined;
  }
  return CarClass as any
}
CarMixin.appliesTo = schema.Car
CarMixin.createFactory = (env: RdfineEnvironment) => createFactory<Car>([VehicleMixin, CarMixin], { types: [schema.Car] }, env)
