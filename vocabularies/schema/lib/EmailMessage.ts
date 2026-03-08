import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MessageMixin } from './Message.js';

export interface EmailMessage<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Message<D>, rdfine.RdfResource<D> {
}

export function EmailMessageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EmailMessage & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EmailMessageClass extends MessageMixin(Resource) {
  }
  return EmailMessageClass as any
}
EmailMessageMixin.appliesTo = schema.EmailMessage
EmailMessageMixin.createFactory = (env: RdfineEnvironment) => createFactory<EmailMessage>([MessageMixin, EmailMessageMixin], { types: [schema.EmailMessage] }, env)
