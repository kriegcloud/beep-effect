import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AudioObjectMixin } from './AudioObject.js';

export interface AudioObjectSnapshot<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AudioObject<D>, rdfine.RdfResource<D> {
}

export function AudioObjectSnapshotMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AudioObjectSnapshot & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AudioObjectSnapshotClass extends AudioObjectMixin(Resource) {
  }
  return AudioObjectSnapshotClass as any
}
AudioObjectSnapshotMixin.appliesTo = schema.AudioObjectSnapshot
AudioObjectSnapshotMixin.createFactory = (env: RdfineEnvironment) => createFactory<AudioObjectSnapshot>([AudioObjectMixin, AudioObjectSnapshotMixin], { types: [schema.AudioObjectSnapshot] }, env)
