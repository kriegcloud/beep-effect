import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface ParkingFacility<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function ParkingFacilityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ParkingFacility & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ParkingFacilityClass extends CivicStructureMixin(Resource) {
  }
  return ParkingFacilityClass as any
}
ParkingFacilityMixin.appliesTo = schema.ParkingFacility
ParkingFacilityMixin.createFactory = (env: RdfineEnvironment) => createFactory<ParkingFacility>([CivicStructureMixin, ParkingFacilityMixin], { types: [schema.ParkingFacility] }, env)
