import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { GovernmentBuildingMixin } from './GovernmentBuilding.js';

export interface CityHall<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.GovernmentBuilding<D>, rdfine.RdfResource<D> {
}

export function CityHallMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CityHall & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CityHallClass extends GovernmentBuildingMixin(Resource) {
  }
  return CityHallClass as any
}
CityHallMixin.appliesTo = schema.CityHall
CityHallMixin.createFactory = (env: RdfineEnvironment) => createFactory<CityHall>([GovernmentBuildingMixin, CityHallMixin], { types: [schema.CityHall] }, env)
