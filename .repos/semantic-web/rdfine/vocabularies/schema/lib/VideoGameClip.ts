import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ClipMixin } from './Clip.js';

export interface VideoGameClip<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Clip<D>, rdfine.RdfResource<D> {
}

export function VideoGameClipMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<VideoGameClip & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class VideoGameClipClass extends ClipMixin(Resource) {
  }
  return VideoGameClipClass as any
}
VideoGameClipMixin.appliesTo = schema.VideoGameClip
VideoGameClipMixin.createFactory = (env: RdfineEnvironment) => createFactory<VideoGameClip>([ClipMixin, VideoGameClipMixin], { types: [schema.VideoGameClip] }, env)
