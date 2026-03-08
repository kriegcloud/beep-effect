import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { RoomMixin } from './Room.js';

export interface MeetingRoom<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Room<D>, rdfine.RdfResource<D> {
}

export function MeetingRoomMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MeetingRoom & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MeetingRoomClass extends RoomMixin(Resource) {
  }
  return MeetingRoomClass as any
}
MeetingRoomMixin.appliesTo = schema.MeetingRoom
MeetingRoomMixin.createFactory = (env: RdfineEnvironment) => createFactory<MeetingRoom>([RoomMixin, MeetingRoomMixin], { types: [schema.MeetingRoom] }, env)
