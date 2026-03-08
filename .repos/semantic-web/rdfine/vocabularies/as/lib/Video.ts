import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { DocumentMixin } from './Document.js';

export interface Video<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Document<D>, rdfine.RdfResource<D> {
}

export function VideoMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Video & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class VideoClass extends DocumentMixin(Resource) {
  }
  return VideoClass as any
}
VideoMixin.appliesTo = as.Video
VideoMixin.createFactory = (env: RdfineEnvironment) => createFactory<Video>([DocumentMixin, VideoMixin], { types: [as.Video] }, env)
