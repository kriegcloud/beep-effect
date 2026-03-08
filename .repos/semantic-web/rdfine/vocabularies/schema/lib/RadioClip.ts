import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ClipMixin } from './Clip.js';

export interface RadioClip<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Clip<D>, rdfine.RdfResource<D> {
}

export function RadioClipMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RadioClip & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RadioClipClass extends ClipMixin(Resource) {
  }
  return RadioClipClass as any
}
RadioClipMixin.appliesTo = schema.RadioClip
RadioClipMixin.createFactory = (env: RdfineEnvironment) => createFactory<RadioClip>([ClipMixin, RadioClipMixin], { types: [schema.RadioClip] }, env)
