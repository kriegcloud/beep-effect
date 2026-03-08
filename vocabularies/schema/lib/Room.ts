import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AccommodationMixin } from './Accommodation.js';

export interface Room<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Accommodation<D>, rdfine.RdfResource<D> {
}

export function RoomMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Room & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RoomClass extends AccommodationMixin(Resource) {
  }
  return RoomClass as any
}
RoomMixin.appliesTo = schema.Room
RoomMixin.createFactory = (env: RdfineEnvironment) => createFactory<Room>([AccommodationMixin, RoomMixin], { types: [schema.Room] }, env)
