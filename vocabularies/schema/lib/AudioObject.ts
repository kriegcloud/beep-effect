import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MediaObjectMixin } from './MediaObject.js';

export interface AudioObject<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MediaObject<D>, rdfine.RdfResource<D> {
  caption: Schema.MediaObject<D> | undefined;
  captionLiteral: string | undefined;
  embeddedTextCaption: string | undefined;
  transcript: string | undefined;
}

export function AudioObjectMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AudioObject & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AudioObjectClass extends MediaObjectMixin(Resource) {
    @rdfine.property.resource()
    caption: Schema.MediaObject | undefined;
    @rdfine.property.literal({ path: schema.caption })
    captionLiteral: string | undefined;
    @rdfine.property.literal()
    embeddedTextCaption: string | undefined;
    @rdfine.property.literal()
    transcript: string | undefined;
  }
  return AudioObjectClass as any
}
AudioObjectMixin.appliesTo = schema.AudioObject
AudioObjectMixin.createFactory = (env: RdfineEnvironment) => createFactory<AudioObject>([MediaObjectMixin, AudioObjectMixin], { types: [schema.AudioObject] }, env)
