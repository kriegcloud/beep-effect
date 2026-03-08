import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Season<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
}

export function SeasonMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Season & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SeasonClass extends CreativeWorkMixin(Resource) {
  }
  return SeasonClass as any
}
SeasonMixin.appliesTo = schema.Season
SeasonMixin.createFactory = (env: RdfineEnvironment) => createFactory<Season>([CreativeWorkMixin, SeasonMixin], { types: [schema.Season] }, env)
