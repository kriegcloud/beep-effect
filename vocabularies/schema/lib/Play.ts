import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Play<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
}

export function PlayMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Play & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PlayClass extends CreativeWorkMixin(Resource) {
  }
  return PlayClass as any
}
PlayMixin.appliesTo = schema.Play
PlayMixin.createFactory = (env: RdfineEnvironment) => createFactory<Play>([CreativeWorkMixin, PlayMixin], { types: [schema.Play] }, env)
