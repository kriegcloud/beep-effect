import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MediaObjectMixin } from './MediaObject.js';

export interface MusicVideoObject<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MediaObject<D>, rdfine.RdfResource<D> {
}

export function MusicVideoObjectMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MusicVideoObject & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MusicVideoObjectClass extends MediaObjectMixin(Resource) {
  }
  return MusicVideoObjectClass as any
}
MusicVideoObjectMixin.appliesTo = schema.MusicVideoObject
MusicVideoObjectMixin.createFactory = (env: RdfineEnvironment) => createFactory<MusicVideoObject>([MediaObjectMixin, MusicVideoObjectMixin], { types: [schema.MusicVideoObject] }, env)
