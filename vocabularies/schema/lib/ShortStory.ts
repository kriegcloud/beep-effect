import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface ShortStory<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
}

export function ShortStoryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ShortStory & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ShortStoryClass extends CreativeWorkMixin(Resource) {
  }
  return ShortStoryClass as any
}
ShortStoryMixin.appliesTo = schema.ShortStory
ShortStoryMixin.createFactory = (env: RdfineEnvironment) => createFactory<ShortStory>([CreativeWorkMixin, ShortStoryMixin], { types: [schema.ShortStory] }, env)
