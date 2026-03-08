import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface PublicationEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
  free: boolean | undefined;
  publishedBy: Schema.Organization<D> | Schema.Person<D> | undefined;
  publishedOn: Schema.BroadcastService<D> | undefined;
}

export function PublicationEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PublicationEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PublicationEventClass extends EventMixin(Resource) {
    @rdfine.property.literal({ type: Boolean })
    free: boolean | undefined;
    @rdfine.property.resource()
    publishedBy: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    publishedOn: Schema.BroadcastService | undefined;
  }
  return PublicationEventClass as any
}
PublicationEventMixin.appliesTo = schema.PublicationEvent
PublicationEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<PublicationEvent>([EventMixin, PublicationEventMixin], { types: [schema.PublicationEvent] }, env)
