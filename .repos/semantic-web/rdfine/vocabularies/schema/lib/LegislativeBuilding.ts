import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { GovernmentBuildingMixin } from './GovernmentBuilding.js';

export interface LegislativeBuilding<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.GovernmentBuilding<D>, rdfine.RdfResource<D> {
}

export function LegislativeBuildingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LegislativeBuilding & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LegislativeBuildingClass extends GovernmentBuildingMixin(Resource) {
  }
  return LegislativeBuildingClass as any
}
LegislativeBuildingMixin.appliesTo = schema.LegislativeBuilding
LegislativeBuildingMixin.createFactory = (env: RdfineEnvironment) => createFactory<LegislativeBuilding>([GovernmentBuildingMixin, LegislativeBuildingMixin], { types: [schema.LegislativeBuilding] }, env)
