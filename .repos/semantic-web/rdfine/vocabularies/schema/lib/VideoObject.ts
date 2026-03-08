import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MediaObjectMixin } from './MediaObject.js';

export interface VideoObject<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MediaObject<D>, rdfine.RdfResource<D> {
  actor: Schema.Person<D> | undefined;
  actors: Schema.Person<D> | undefined;
  caption: Schema.MediaObject<D> | undefined;
  captionLiteral: string | undefined;
  director: Schema.Person<D> | undefined;
  directors: Schema.Person<D> | undefined;
  embeddedTextCaption: string | undefined;
  musicBy: Schema.MusicGroup<D> | Schema.Person<D> | undefined;
  thumbnail: Schema.ImageObject<D> | undefined;
  transcript: string | undefined;
  videoFrameSize: string | undefined;
  videoQuality: string | undefined;
}

export function VideoObjectMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<VideoObject & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class VideoObjectClass extends MediaObjectMixin(Resource) {
    @rdfine.property.resource()
    actor: Schema.Person | undefined;
    @rdfine.property.resource()
    actors: Schema.Person | undefined;
    @rdfine.property.resource()
    caption: Schema.MediaObject | undefined;
    @rdfine.property.literal({ path: schema.caption })
    captionLiteral: string | undefined;
    @rdfine.property.resource()
    director: Schema.Person | undefined;
    @rdfine.property.resource()
    directors: Schema.Person | undefined;
    @rdfine.property.literal()
    embeddedTextCaption: string | undefined;
    @rdfine.property.resource()
    musicBy: Schema.MusicGroup | Schema.Person | undefined;
    @rdfine.property.resource()
    thumbnail: Schema.ImageObject | undefined;
    @rdfine.property.literal()
    transcript: string | undefined;
    @rdfine.property.literal()
    videoFrameSize: string | undefined;
    @rdfine.property.literal()
    videoQuality: string | undefined;
  }
  return VideoObjectClass as any
}
VideoObjectMixin.appliesTo = schema.VideoObject
VideoObjectMixin.createFactory = (env: RdfineEnvironment) => createFactory<VideoObject>([MediaObjectMixin, VideoObjectMixin], { types: [schema.VideoObject] }, env)
