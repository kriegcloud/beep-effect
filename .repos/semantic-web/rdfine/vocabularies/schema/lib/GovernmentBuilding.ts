import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface GovernmentBuilding<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function GovernmentBuildingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GovernmentBuilding & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GovernmentBuildingClass extends CivicStructureMixin(Resource) {
  }
  return GovernmentBuildingClass as any
}
GovernmentBuildingMixin.appliesTo = schema.GovernmentBuilding
GovernmentBuildingMixin.createFactory = (env: RdfineEnvironment) => createFactory<GovernmentBuilding>([CivicStructureMixin, GovernmentBuildingMixin], { types: [schema.GovernmentBuilding] }, env)
