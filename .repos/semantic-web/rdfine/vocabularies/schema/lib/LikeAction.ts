import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReactActionMixin } from './ReactAction.js';

export interface LikeAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ReactAction<D>, rdfine.RdfResource<D> {
}

export function LikeActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LikeAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LikeActionClass extends ReactActionMixin(Resource) {
  }
  return LikeActionClass as any
}
LikeActionMixin.appliesTo = schema.LikeAction
LikeActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<LikeAction>([ReactActionMixin, LikeActionMixin], { types: [schema.LikeAction] }, env)
