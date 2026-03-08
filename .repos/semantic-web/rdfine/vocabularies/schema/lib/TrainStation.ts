import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface TrainStation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function TrainStationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TrainStation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TrainStationClass extends CivicStructureMixin(Resource) {
  }
  return TrainStationClass as any
}
TrainStationMixin.appliesTo = schema.TrainStation
TrainStationMixin.createFactory = (env: RdfineEnvironment) => createFactory<TrainStation>([CivicStructureMixin, TrainStationMixin], { types: [schema.TrainStation] }, env)
