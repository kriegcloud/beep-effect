import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ExtentMixin } from './Extent.js';

export interface RecordResourceExtent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Extent<D>, rdfine.RdfResource<D> {
}

export function RecordResourceExtentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RecordResourceExtent & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class RecordResourceExtentClass extends ExtentMixin(Resource) {
  }
  return RecordResourceExtentClass as any
}
RecordResourceExtentMixin.appliesTo = rico.RecordResourceExtent
RecordResourceExtentMixin.createFactory = (env: RdfineEnvironment) => createFactory<RecordResourceExtent>([ExtentMixin, RecordResourceExtentMixin], { types: [rico.RecordResourceExtent] }, env)
