import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';
import { CreativeWorkSeasonMixin } from './CreativeWorkSeason.js';

export interface TVSeason<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, Schema.CreativeWorkSeason<D>, rdfine.RdfResource<D> {
  countryOfOrigin: Schema.Country<D> | undefined;
  partOfTVSeries: Schema.TVSeries<D> | undefined;
}

export function TVSeasonMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TVSeason & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TVSeasonClass extends CreativeWorkSeasonMixin(CreativeWorkMixin(Resource)) {
    @rdfine.property.resource()
    countryOfOrigin: Schema.Country | undefined;
    @rdfine.property.resource()
    partOfTVSeries: Schema.TVSeries | undefined;
  }
  return TVSeasonClass as any
}
TVSeasonMixin.appliesTo = schema.TVSeason
TVSeasonMixin.createFactory = (env: RdfineEnvironment) => createFactory<TVSeason>([CreativeWorkSeasonMixin, CreativeWorkMixin, TVSeasonMixin], { types: [schema.TVSeason] }, env)
