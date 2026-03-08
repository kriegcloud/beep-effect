import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';

export interface CategoryCode<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  codeValue: string | undefined;
  inCodeSet: Schema.CategoryCodeSet<D> | undefined;
}

export function CategoryCodeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CategoryCode & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CategoryCodeClass extends Resource {
    @rdfine.property.literal()
    codeValue: string | undefined;
    @rdfine.property.resource()
    inCodeSet: Schema.CategoryCodeSet | undefined;
  }
  return CategoryCodeClass as any
}
CategoryCodeMixin.appliesTo = schema.CategoryCode
CategoryCodeMixin.createFactory = (env: RdfineEnvironment) => createFactory<CategoryCode>([CategoryCodeMixin], { types: [schema.CategoryCode] }, env)
