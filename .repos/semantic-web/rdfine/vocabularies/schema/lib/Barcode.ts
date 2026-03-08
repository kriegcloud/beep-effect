import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ImageObjectMixin } from './ImageObject.js';

export interface Barcode<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ImageObject<D>, rdfine.RdfResource<D> {
}

export function BarcodeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Barcode & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BarcodeClass extends ImageObjectMixin(Resource) {
  }
  return BarcodeClass as any
}
BarcodeMixin.appliesTo = schema.Barcode
BarcodeMixin.createFactory = (env: RdfineEnvironment) => createFactory<Barcode>([ImageObjectMixin, BarcodeMixin], { types: [schema.Barcode] }, env)
