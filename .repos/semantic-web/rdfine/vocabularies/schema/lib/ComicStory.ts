import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface ComicStory<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  artist: Schema.Person<D> | undefined;
  colorist: Schema.Person<D> | undefined;
  inker: Schema.Person<D> | undefined;
  letterer: Schema.Person<D> | undefined;
  penciler: Schema.Person<D> | undefined;
}

export function ComicStoryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ComicStory & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ComicStoryClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    artist: Schema.Person | undefined;
    @rdfine.property.resource()
    colorist: Schema.Person | undefined;
    @rdfine.property.resource()
    inker: Schema.Person | undefined;
    @rdfine.property.resource()
    letterer: Schema.Person | undefined;
    @rdfine.property.resource()
    penciler: Schema.Person | undefined;
  }
  return ComicStoryClass as any
}
ComicStoryMixin.appliesTo = schema.ComicStory
ComicStoryMixin.createFactory = (env: RdfineEnvironment) => createFactory<ComicStory>([CreativeWorkMixin, ComicStoryMixin], { types: [schema.ComicStory] }, env)
