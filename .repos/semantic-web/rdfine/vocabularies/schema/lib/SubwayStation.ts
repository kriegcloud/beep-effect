import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface SubwayStation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function SubwayStationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SubwayStation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SubwayStationClass extends CivicStructureMixin(Resource) {
  }
  return SubwayStationClass as any
}
SubwayStationMixin.appliesTo = schema.SubwayStation
SubwayStationMixin.createFactory = (env: RdfineEnvironment) => createFactory<SubwayStation>([CivicStructureMixin, SubwayStationMixin], { types: [schema.SubwayStation] }, env)
