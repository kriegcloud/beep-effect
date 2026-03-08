import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { DigitalDocumentMixin } from './DigitalDocument.js';

export interface TextDigitalDocument<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.DigitalDocument<D>, rdfine.RdfResource<D> {
}

export function TextDigitalDocumentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TextDigitalDocument & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TextDigitalDocumentClass extends DigitalDocumentMixin(Resource) {
  }
  return TextDigitalDocumentClass as any
}
TextDigitalDocumentMixin.appliesTo = schema.TextDigitalDocument
TextDigitalDocumentMixin.createFactory = (env: RdfineEnvironment) => createFactory<TextDigitalDocument>([DigitalDocumentMixin, TextDigitalDocumentMixin], { types: [schema.TextDigitalDocument] }, env)
