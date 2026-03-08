import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface Park<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function ParkMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Park & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ParkClass extends CivicStructureMixin(Resource) {
  }
  return ParkClass as any
}
ParkMixin.appliesTo = schema.Park
ParkMixin.createFactory = (env: RdfineEnvironment) => createFactory<Park>([CivicStructureMixin, ParkMixin], { types: [schema.Park] }, env)
