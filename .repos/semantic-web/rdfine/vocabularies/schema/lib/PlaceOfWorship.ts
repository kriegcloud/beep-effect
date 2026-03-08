import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface PlaceOfWorship<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function PlaceOfWorshipMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PlaceOfWorship & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PlaceOfWorshipClass extends CivicStructureMixin(Resource) {
  }
  return PlaceOfWorshipClass as any
}
PlaceOfWorshipMixin.appliesTo = schema.PlaceOfWorship
PlaceOfWorshipMixin.createFactory = (env: RdfineEnvironment) => createFactory<PlaceOfWorship>([CivicStructureMixin, PlaceOfWorshipMixin], { types: [schema.PlaceOfWorship] }, env)
