import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BroadcastChannelMixin } from './BroadcastChannel.js';

export interface RadioChannel<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BroadcastChannel<D>, rdfine.RdfResource<D> {
}

export function RadioChannelMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RadioChannel & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RadioChannelClass extends BroadcastChannelMixin(Resource) {
  }
  return RadioChannelClass as any
}
RadioChannelMixin.appliesTo = schema.RadioChannel
RadioChannelMixin.createFactory = (env: RdfineEnvironment) => createFactory<RadioChannel>([BroadcastChannelMixin, RadioChannelMixin], { types: [schema.RadioChannel] }, env)
