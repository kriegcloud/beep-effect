import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BroadcastServiceMixin } from './BroadcastService.js';

export interface RadioBroadcastService<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BroadcastService<D>, rdfine.RdfResource<D> {
}

export function RadioBroadcastServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RadioBroadcastService & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RadioBroadcastServiceClass extends BroadcastServiceMixin(Resource) {
  }
  return RadioBroadcastServiceClass as any
}
RadioBroadcastServiceMixin.appliesTo = schema.RadioBroadcastService
RadioBroadcastServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<RadioBroadcastService>([BroadcastServiceMixin, RadioBroadcastServiceMixin], { types: [schema.RadioBroadcastService] }, env)
