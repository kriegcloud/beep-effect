import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Movie<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  actor: Schema.Person<D> | undefined;
  actors: Schema.Person<D> | undefined;
  countryOfOrigin: Schema.Country<D> | undefined;
  director: Schema.Person<D> | undefined;
  directors: Schema.Person<D> | undefined;
  duration: Schema.Duration<D> | undefined;
  musicBy: Schema.MusicGroup<D> | Schema.Person<D> | undefined;
  productionCompany: Schema.Organization<D> | undefined;
  subtitleLanguage: Schema.Language<D> | undefined;
  subtitleLanguageLiteral: string | undefined;
  titleEIDR: string | undefined;
  titleEIDRTerm: RDF.NamedNode | undefined;
  trailer: Schema.VideoObject<D> | undefined;
}

export function MovieMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Movie & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MovieClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    actor: Schema.Person | undefined;
    @rdfine.property.resource()
    actors: Schema.Person | undefined;
    @rdfine.property.resource()
    countryOfOrigin: Schema.Country | undefined;
    @rdfine.property.resource()
    director: Schema.Person | undefined;
    @rdfine.property.resource()
    directors: Schema.Person | undefined;
    @rdfine.property.resource()
    duration: Schema.Duration | undefined;
    @rdfine.property.resource()
    musicBy: Schema.MusicGroup | Schema.Person | undefined;
    @rdfine.property.resource()
    productionCompany: Schema.Organization | undefined;
    @rdfine.property.resource()
    subtitleLanguage: Schema.Language | undefined;
    @rdfine.property.literal({ path: schema.subtitleLanguage })
    subtitleLanguageLiteral: string | undefined;
    @rdfine.property.literal()
    titleEIDR: string | undefined;
    @rdfine.property({ path: schema.titleEIDR })
    titleEIDRTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    trailer: Schema.VideoObject | undefined;
  }
  return MovieClass as any
}
MovieMixin.appliesTo = schema.Movie
MovieMixin.createFactory = (env: RdfineEnvironment) => createFactory<Movie>([CreativeWorkMixin, MovieMixin], { types: [schema.Movie] }, env)
