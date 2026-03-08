import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface BusStation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function BusStationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BusStation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BusStationClass extends CivicStructureMixin(Resource) {
  }
  return BusStationClass as any
}
BusStationMixin.appliesTo = schema.BusStation
BusStationMixin.createFactory = (env: RdfineEnvironment) => createFactory<BusStation>([CivicStructureMixin, BusStationMixin], { types: [schema.BusStation] }, env)
