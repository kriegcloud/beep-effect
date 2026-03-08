import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlaceOfWorshipMixin } from './PlaceOfWorship.js';

export interface BuddhistTemple<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PlaceOfWorship<D>, rdfine.RdfResource<D> {
}

export function BuddhistTempleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BuddhistTemple & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BuddhistTempleClass extends PlaceOfWorshipMixin(Resource) {
  }
  return BuddhistTempleClass as any
}
BuddhistTempleMixin.appliesTo = schema.BuddhistTemple
BuddhistTempleMixin.createFactory = (env: RdfineEnvironment) => createFactory<BuddhistTemple>([PlaceOfWorshipMixin, BuddhistTempleMixin], { types: [schema.BuddhistTemple] }, env)
