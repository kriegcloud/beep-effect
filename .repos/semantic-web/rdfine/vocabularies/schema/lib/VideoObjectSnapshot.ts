import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { VideoObjectMixin } from './VideoObject.js';

export interface VideoObjectSnapshot<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.VideoObject<D>, rdfine.RdfResource<D> {
}

export function VideoObjectSnapshotMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<VideoObjectSnapshot & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class VideoObjectSnapshotClass extends VideoObjectMixin(Resource) {
  }
  return VideoObjectSnapshotClass as any
}
VideoObjectSnapshotMixin.appliesTo = schema.VideoObjectSnapshot
VideoObjectSnapshotMixin.createFactory = (env: RdfineEnvironment) => createFactory<VideoObjectSnapshot>([VideoObjectMixin, VideoObjectSnapshotMixin], { types: [schema.VideoObjectSnapshot] }, env)
