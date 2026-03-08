import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface LiteraryEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
}

export function LiteraryEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LiteraryEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LiteraryEventClass extends EventMixin(Resource) {
  }
  return LiteraryEventClass as any
}
LiteraryEventMixin.appliesTo = schema.LiteraryEvent
LiteraryEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<LiteraryEvent>([EventMixin, LiteraryEventMixin], { types: [schema.LiteraryEvent] }, env)
