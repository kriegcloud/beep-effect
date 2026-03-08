import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Chapter<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  pageEnd: number | string | undefined;
  pageStart: number | string | undefined;
  pagination: string | undefined;
}

export function ChapterMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Chapter & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ChapterClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.literal()
    pageEnd: number | string | undefined;
    @rdfine.property.literal()
    pageStart: number | string | undefined;
    @rdfine.property.literal()
    pagination: string | undefined;
  }
  return ChapterClass as any
}
ChapterMixin.appliesTo = schema.Chapter
ChapterMixin.createFactory = (env: RdfineEnvironment) => createFactory<Chapter>([CreativeWorkMixin, ChapterMixin], { types: [schema.Chapter] }, env)
