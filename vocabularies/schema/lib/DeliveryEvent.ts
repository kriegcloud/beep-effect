import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface DeliveryEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
  accessCode: string | undefined;
  availableFrom: Date | undefined;
  availableThrough: Date | undefined;
  hasDeliveryMethod: Schema.DeliveryMethod | undefined;
}

export function DeliveryEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DeliveryEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DeliveryEventClass extends EventMixin(Resource) {
    @rdfine.property.literal()
    accessCode: string | undefined;
    @rdfine.property.literal({ type: Date })
    availableFrom: Date | undefined;
    @rdfine.property.literal({ type: Date })
    availableThrough: Date | undefined;
    @rdfine.property()
    hasDeliveryMethod: Schema.DeliveryMethod | undefined;
  }
  return DeliveryEventClass as any
}
DeliveryEventMixin.appliesTo = schema.DeliveryEvent
DeliveryEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<DeliveryEvent>([EventMixin, DeliveryEventMixin], { types: [schema.DeliveryEvent] }, env)
