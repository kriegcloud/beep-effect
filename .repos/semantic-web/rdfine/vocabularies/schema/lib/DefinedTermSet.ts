import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface DefinedTermSet<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  hasDefinedTerm: RDF.Term | undefined;
}

export function DefinedTermSetMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DefinedTermSet & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DefinedTermSetClass extends CreativeWorkMixin(Resource) {
    @rdfine.property()
    hasDefinedTerm: RDF.Term | undefined;
  }
  return DefinedTermSetClass as any
}
DefinedTermSetMixin.appliesTo = schema.DefinedTermSet
DefinedTermSetMixin.createFactory = (env: RdfineEnvironment) => createFactory<DefinedTermSet>([CreativeWorkMixin, DefinedTermSetMixin], { types: [schema.DefinedTermSet] }, env)
