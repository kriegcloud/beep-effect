import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { VehicleMixin } from './Vehicle.js';

export interface BusOrCoach<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Vehicle<D>, rdfine.RdfResource<D> {
  acrissCode: string | undefined;
  roofLoad: Schema.QuantitativeValue<D> | undefined;
}

export function BusOrCoachMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BusOrCoach & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BusOrCoachClass extends VehicleMixin(Resource) {
    @rdfine.property.literal()
    acrissCode: string | undefined;
    @rdfine.property.resource()
    roofLoad: Schema.QuantitativeValue | undefined;
  }
  return BusOrCoachClass as any
}
BusOrCoachMixin.appliesTo = schema.BusOrCoach
BusOrCoachMixin.createFactory = (env: RdfineEnvironment) => createFactory<BusOrCoach>([VehicleMixin, BusOrCoachMixin], { types: [schema.BusOrCoach] }, env)
