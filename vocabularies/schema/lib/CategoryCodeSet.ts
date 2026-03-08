import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { DefinedTermSetMixin } from './DefinedTermSet.js';

export interface CategoryCodeSet<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.DefinedTermSet<D>, rdfine.RdfResource<D> {
  hasCategoryCode: Schema.CategoryCode<D> | undefined;
}

export function CategoryCodeSetMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CategoryCodeSet & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CategoryCodeSetClass extends DefinedTermSetMixin(Resource) {
    @rdfine.property.resource()
    hasCategoryCode: Schema.CategoryCode | undefined;
  }
  return CategoryCodeSetClass as any
}
CategoryCodeSetMixin.appliesTo = schema.CategoryCodeSet
CategoryCodeSetMixin.createFactory = (env: RdfineEnvironment) => createFactory<CategoryCodeSet>([DefinedTermSetMixin, CategoryCodeSetMixin], { types: [schema.CategoryCodeSet] }, env)
