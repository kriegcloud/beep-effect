import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface ChildrensEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
}

export function ChildrensEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ChildrensEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ChildrensEventClass extends EventMixin(Resource) {
  }
  return ChildrensEventClass as any
}
ChildrensEventMixin.appliesTo = schema.ChildrensEvent
ChildrensEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<ChildrensEvent>([EventMixin, ChildrensEventMixin], { types: [schema.ChildrensEvent] }, env)
