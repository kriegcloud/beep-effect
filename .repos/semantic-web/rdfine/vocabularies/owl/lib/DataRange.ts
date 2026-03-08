import '../extensions/rdfs/Datatype.js';
import { DatatypeMixinEx } from '../extensions/rdfs/Datatype.js';
import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { DatatypeMixin as RdfsDatatypeMixin } from '@rdfine/rdfs/lib/Datatype';

export interface DataRange<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Datatype<D>, rdfine.RdfResource<D> {
}

export function DataRangeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DataRange & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class DataRangeClass extends DatatypeMixinEx(RdfsDatatypeMixin(Resource)) {
  }
  return DataRangeClass as any
}
DataRangeMixin.appliesTo = owl.DataRange
DataRangeMixin.createFactory = (env: RdfineEnvironment) => createFactory<DataRange>([RdfsDatatypeMixin, DataRangeMixin], { types: [owl.DataRange] }, env)
