import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Code<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
}

export function CodeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Code & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CodeClass extends CreativeWorkMixin(Resource) {
  }
  return CodeClass as any
}
CodeMixin.appliesTo = schema.Code
CodeMixin.createFactory = (env: RdfineEnvironment) => createFactory<Code>([CreativeWorkMixin, CodeMixin], { types: [schema.Code] }, env)
