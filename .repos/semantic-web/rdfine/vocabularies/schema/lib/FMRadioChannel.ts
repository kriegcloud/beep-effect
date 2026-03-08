import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { RadioChannelMixin } from './RadioChannel.js';

export interface FMRadioChannel<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.RadioChannel<D>, rdfine.RdfResource<D> {
}

export function FMRadioChannelMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FMRadioChannel & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FMRadioChannelClass extends RadioChannelMixin(Resource) {
  }
  return FMRadioChannelClass as any
}
FMRadioChannelMixin.appliesTo = schema.FMRadioChannel
FMRadioChannelMixin.createFactory = (env: RdfineEnvironment) => createFactory<FMRadioChannel>([RadioChannelMixin, FMRadioChannelMixin], { types: [schema.FMRadioChannel] }, env)
