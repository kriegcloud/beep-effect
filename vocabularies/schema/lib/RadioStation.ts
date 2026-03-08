import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface RadioStation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function RadioStationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RadioStation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RadioStationClass extends LocalBusinessMixin(Resource) {
  }
  return RadioStationClass as any
}
RadioStationMixin.appliesTo = schema.RadioStation
RadioStationMixin.createFactory = (env: RdfineEnvironment) => createFactory<RadioStation>([LocalBusinessMixin, RadioStationMixin], { types: [schema.RadioStation] }, env)
