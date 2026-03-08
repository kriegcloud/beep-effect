import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Manuscript<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
}

export function ManuscriptMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Manuscript & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ManuscriptClass extends CreativeWorkMixin(Resource) {
  }
  return ManuscriptClass as any
}
ManuscriptMixin.appliesTo = schema.Manuscript
ManuscriptMixin.createFactory = (env: RdfineEnvironment) => createFactory<Manuscript>([CreativeWorkMixin, ManuscriptMixin], { types: [schema.Manuscript] }, env)
