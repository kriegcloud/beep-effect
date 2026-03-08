import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlaceMixin } from './Place.js';

export interface LandmarksOrHistoricalBuildings<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Place<D>, rdfine.RdfResource<D> {
}

export function LandmarksOrHistoricalBuildingsMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LandmarksOrHistoricalBuildings & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LandmarksOrHistoricalBuildingsClass extends PlaceMixin(Resource) {
  }
  return LandmarksOrHistoricalBuildingsClass as any
}
LandmarksOrHistoricalBuildingsMixin.appliesTo = schema.LandmarksOrHistoricalBuildings
LandmarksOrHistoricalBuildingsMixin.createFactory = (env: RdfineEnvironment) => createFactory<LandmarksOrHistoricalBuildings>([PlaceMixin, LandmarksOrHistoricalBuildingsMixin], { types: [schema.LandmarksOrHistoricalBuildings] }, env)
