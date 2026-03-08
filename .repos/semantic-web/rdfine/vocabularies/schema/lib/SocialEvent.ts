import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface SocialEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
}

export function SocialEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SocialEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SocialEventClass extends EventMixin(Resource) {
  }
  return SocialEventClass as any
}
SocialEventMixin.appliesTo = schema.SocialEvent
SocialEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<SocialEvent>([EventMixin, SocialEventMixin], { types: [schema.SocialEvent] }, env)
