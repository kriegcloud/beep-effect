import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Message<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  bccRecipient: Schema.ContactPoint<D> | Schema.Organization<D> | Schema.Person<D> | undefined;
  ccRecipient: Schema.ContactPoint<D> | Schema.Organization<D> | Schema.Person<D> | undefined;
  dateRead: Date | undefined;
  dateReceived: Date | undefined;
  dateSent: Date | undefined;
  messageAttachment: Schema.CreativeWork<D> | undefined;
  recipient: Schema.Audience<D> | Schema.ContactPoint<D> | Schema.Organization<D> | Schema.Person<D> | undefined;
  sender: Schema.Audience<D> | Schema.Organization<D> | Schema.Person<D> | undefined;
  toRecipient: Schema.Audience<D> | Schema.ContactPoint<D> | Schema.Organization<D> | Schema.Person<D> | undefined;
}

export function MessageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Message & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MessageClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    bccRecipient: Schema.ContactPoint | Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    ccRecipient: Schema.ContactPoint | Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    dateRead: Date | undefined;
    @rdfine.property.literal({ type: Date })
    dateReceived: Date | undefined;
    @rdfine.property.literal({ type: Date })
    dateSent: Date | undefined;
    @rdfine.property.resource()
    messageAttachment: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    recipient: Schema.Audience | Schema.ContactPoint | Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    sender: Schema.Audience | Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    toRecipient: Schema.Audience | Schema.ContactPoint | Schema.Organization | Schema.Person | undefined;
  }
  return MessageClass as any
}
MessageMixin.appliesTo = schema.Message
MessageMixin.createFactory = (env: RdfineEnvironment) => createFactory<Message>([CreativeWorkMixin, MessageMixin], { types: [schema.Message] }, env)
