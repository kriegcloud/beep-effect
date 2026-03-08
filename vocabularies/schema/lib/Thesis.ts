import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Thesis<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  inSupportOf: string | undefined;
}

export function ThesisMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Thesis & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ThesisClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.literal()
    inSupportOf: string | undefined;
  }
  return ThesisClass as any
}
ThesisMixin.appliesTo = schema.Thesis
ThesisMixin.createFactory = (env: RdfineEnvironment) => createFactory<Thesis>([CreativeWorkMixin, ThesisMixin], { types: [schema.Thesis] }, env)
