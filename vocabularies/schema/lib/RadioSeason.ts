import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkSeasonMixin } from './CreativeWorkSeason.js';

export interface RadioSeason<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWorkSeason<D>, rdfine.RdfResource<D> {
}

export function RadioSeasonMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RadioSeason & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RadioSeasonClass extends CreativeWorkSeasonMixin(Resource) {
  }
  return RadioSeasonClass as any
}
RadioSeasonMixin.appliesTo = schema.RadioSeason
RadioSeasonMixin.createFactory = (env: RdfineEnvironment) => createFactory<RadioSeason>([CreativeWorkSeasonMixin, RadioSeasonMixin], { types: [schema.RadioSeason] }, env)
