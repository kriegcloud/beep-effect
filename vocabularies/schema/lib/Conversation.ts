import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Conversation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
}

export function ConversationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Conversation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ConversationClass extends CreativeWorkMixin(Resource) {
  }
  return ConversationClass as any
}
ConversationMixin.appliesTo = schema.Conversation
ConversationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Conversation>([CreativeWorkMixin, ConversationMixin], { types: [schema.Conversation] }, env)
