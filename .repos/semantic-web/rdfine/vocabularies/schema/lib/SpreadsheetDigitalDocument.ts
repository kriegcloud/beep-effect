import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { DigitalDocumentMixin } from './DigitalDocument.js';

export interface SpreadsheetDigitalDocument<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.DigitalDocument<D>, rdfine.RdfResource<D> {
}

export function SpreadsheetDigitalDocumentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SpreadsheetDigitalDocument & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SpreadsheetDigitalDocumentClass extends DigitalDocumentMixin(Resource) {
  }
  return SpreadsheetDigitalDocumentClass as any
}
SpreadsheetDigitalDocumentMixin.appliesTo = schema.SpreadsheetDigitalDocument
SpreadsheetDigitalDocumentMixin.createFactory = (env: RdfineEnvironment) => createFactory<SpreadsheetDigitalDocument>([DigitalDocumentMixin, SpreadsheetDigitalDocumentMixin], { types: [schema.SpreadsheetDigitalDocument] }, env)
