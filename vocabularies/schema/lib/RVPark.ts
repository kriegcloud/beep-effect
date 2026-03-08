import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface RVPark<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function RVParkMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RVPark & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RVParkClass extends CivicStructureMixin(Resource) {
  }
  return RVParkClass as any
}
RVParkMixin.appliesTo = schema.RVPark
RVParkMixin.createFactory = (env: RdfineEnvironment) => createFactory<RVPark>([CivicStructureMixin, RVParkMixin], { types: [schema.RVPark] }, env)
