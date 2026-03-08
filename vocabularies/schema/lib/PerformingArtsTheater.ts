import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface PerformingArtsTheater<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function PerformingArtsTheaterMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PerformingArtsTheater & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PerformingArtsTheaterClass extends CivicStructureMixin(Resource) {
  }
  return PerformingArtsTheaterClass as any
}
PerformingArtsTheaterMixin.appliesTo = schema.PerformingArtsTheater
PerformingArtsTheaterMixin.createFactory = (env: RdfineEnvironment) => createFactory<PerformingArtsTheater>([CivicStructureMixin, PerformingArtsTheaterMixin], { types: [schema.PerformingArtsTheater] }, env)
