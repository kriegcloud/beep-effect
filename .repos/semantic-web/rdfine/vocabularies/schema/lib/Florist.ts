import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface Florist<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function FloristMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Florist & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FloristClass extends StoreMixin(Resource) {
  }
  return FloristClass as any
}
FloristMixin.appliesTo = schema.Florist
FloristMixin.createFactory = (env: RdfineEnvironment) => createFactory<Florist>([StoreMixin, FloristMixin], { types: [schema.Florist] }, env)
