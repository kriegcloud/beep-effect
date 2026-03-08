import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface MusicEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
}

export function MusicEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MusicEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MusicEventClass extends EventMixin(Resource) {
  }
  return MusicEventClass as any
}
MusicEventMixin.appliesTo = schema.MusicEvent
MusicEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<MusicEvent>([EventMixin, MusicEventMixin], { types: [schema.MusicEvent] }, env)
