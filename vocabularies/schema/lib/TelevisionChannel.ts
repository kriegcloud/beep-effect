import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BroadcastChannelMixin } from './BroadcastChannel.js';

export interface TelevisionChannel<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BroadcastChannel<D>, rdfine.RdfResource<D> {
}

export function TelevisionChannelMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TelevisionChannel & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TelevisionChannelClass extends BroadcastChannelMixin(Resource) {
  }
  return TelevisionChannelClass as any
}
TelevisionChannelMixin.appliesTo = schema.TelevisionChannel
TelevisionChannelMixin.createFactory = (env: RdfineEnvironment) => createFactory<TelevisionChannel>([BroadcastChannelMixin, TelevisionChannelMixin], { types: [schema.TelevisionChannel] }, env)
