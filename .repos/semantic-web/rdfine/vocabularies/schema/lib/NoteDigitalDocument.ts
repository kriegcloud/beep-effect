import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { DigitalDocumentMixin } from './DigitalDocument.js';

export interface NoteDigitalDocument<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.DigitalDocument<D>, rdfine.RdfResource<D> {
}

export function NoteDigitalDocumentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<NoteDigitalDocument & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class NoteDigitalDocumentClass extends DigitalDocumentMixin(Resource) {
  }
  return NoteDigitalDocumentClass as any
}
NoteDigitalDocumentMixin.appliesTo = schema.NoteDigitalDocument
NoteDigitalDocumentMixin.createFactory = (env: RdfineEnvironment) => createFactory<NoteDigitalDocument>([DigitalDocumentMixin, NoteDigitalDocumentMixin], { types: [schema.NoteDigitalDocument] }, env)
