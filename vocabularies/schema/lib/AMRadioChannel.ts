import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { RadioChannelMixin } from './RadioChannel.js';

export interface AMRadioChannel<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.RadioChannel<D>, rdfine.RdfResource<D> {
}

export function AMRadioChannelMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AMRadioChannel & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AMRadioChannelClass extends RadioChannelMixin(Resource) {
  }
  return AMRadioChannelClass as any
}
AMRadioChannelMixin.appliesTo = schema.AMRadioChannel
AMRadioChannelMixin.createFactory = (env: RdfineEnvironment) => createFactory<AMRadioChannel>([RadioChannelMixin, AMRadioChannelMixin], { types: [schema.AMRadioChannel] }, env)
