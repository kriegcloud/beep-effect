import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Book<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  abridged: boolean | undefined;
  bookEdition: string | undefined;
  bookFormat: Schema.BookFormatType | undefined;
  illustrator: Schema.Person<D> | undefined;
  isbn: string | undefined;
  numberOfPages: number | undefined;
}

export function BookMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Book & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BookClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.literal({ type: Boolean })
    abridged: boolean | undefined;
    @rdfine.property.literal()
    bookEdition: string | undefined;
    @rdfine.property()
    bookFormat: Schema.BookFormatType | undefined;
    @rdfine.property.resource()
    illustrator: Schema.Person | undefined;
    @rdfine.property.literal()
    isbn: string | undefined;
    @rdfine.property.literal({ type: Number })
    numberOfPages: number | undefined;
  }
  return BookClass as any
}
BookMixin.appliesTo = schema.Book
BookMixin.createFactory = (env: RdfineEnvironment) => createFactory<Book>([CreativeWorkMixin, BookMixin], { types: [schema.Book] }, env)
