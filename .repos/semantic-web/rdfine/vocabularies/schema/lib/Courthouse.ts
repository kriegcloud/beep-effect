import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { GovernmentBuildingMixin } from './GovernmentBuilding.js';

export interface Courthouse<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.GovernmentBuilding<D>, rdfine.RdfResource<D> {
}

export function CourthouseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Courthouse & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CourthouseClass extends GovernmentBuildingMixin(Resource) {
  }
  return CourthouseClass as any
}
CourthouseMixin.appliesTo = schema.Courthouse
CourthouseMixin.createFactory = (env: RdfineEnvironment) => createFactory<Courthouse>([GovernmentBuildingMixin, CourthouseMixin], { types: [schema.Courthouse] }, env)
