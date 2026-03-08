import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';
import { MediaObjectMixin } from './MediaObject.js';

export interface AmpStory<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, Schema.MediaObject<D>, rdfine.RdfResource<D> {
}

export function AmpStoryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AmpStory & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AmpStoryClass extends MediaObjectMixin(CreativeWorkMixin(Resource)) {
  }
  return AmpStoryClass as any
}
AmpStoryMixin.appliesTo = schema.AmpStory
AmpStoryMixin.createFactory = (env: RdfineEnvironment) => createFactory<AmpStory>([MediaObjectMixin, CreativeWorkMixin, AmpStoryMixin], { types: [schema.AmpStory] }, env)
