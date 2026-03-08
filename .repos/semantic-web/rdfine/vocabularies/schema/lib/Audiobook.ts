import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AudioObjectMixin } from './AudioObject.js';
import { BookMixin } from './Book.js';

export interface Audiobook<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AudioObject<D>, Schema.Book<D>, rdfine.RdfResource<D> {
  duration: Schema.Duration<D> | undefined;
  readBy: Schema.Person<D> | undefined;
}

export function AudiobookMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Audiobook & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AudiobookClass extends BookMixin(AudioObjectMixin(Resource)) {
    @rdfine.property.resource()
    duration: Schema.Duration | undefined;
    @rdfine.property.resource()
    readBy: Schema.Person | undefined;
  }
  return AudiobookClass as any
}
AudiobookMixin.appliesTo = schema.Audiobook
AudiobookMixin.createFactory = (env: RdfineEnvironment) => createFactory<Audiobook>([BookMixin, AudioObjectMixin, AudiobookMixin], { types: [schema.Audiobook] }, env)
