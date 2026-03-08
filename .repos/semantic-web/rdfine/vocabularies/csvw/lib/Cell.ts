import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { csvw } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Csvw from '../index.js';

export interface Cell<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function CellMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Cell & RdfResourceCore> & Base {
  @rdfine.namespace(csvw)
  class CellClass extends Resource {
  }
  return CellClass as any
}
CellMixin.appliesTo = csvw.Cell
CellMixin.createFactory = (env: RdfineEnvironment) => createFactory<Cell>([CellMixin], { types: [csvw.Cell] }, env)
