import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface DanceEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
}

export function DanceEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DanceEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DanceEventClass extends EventMixin(Resource) {
  }
  return DanceEventClass as any
}
DanceEventMixin.appliesTo = schema.DanceEvent
DanceEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<DanceEvent>([EventMixin, DanceEventMixin], { types: [schema.DanceEvent] }, env)
