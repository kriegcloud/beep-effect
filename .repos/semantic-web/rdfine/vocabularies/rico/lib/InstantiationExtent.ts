import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ExtentMixin } from './Extent.js';

export interface InstantiationExtent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Extent<D>, rdfine.RdfResource<D> {
}

export function InstantiationExtentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<InstantiationExtent & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class InstantiationExtentClass extends ExtentMixin(Resource) {
  }
  return InstantiationExtentClass as any
}
InstantiationExtentMixin.appliesTo = rico.InstantiationExtent
InstantiationExtentMixin.createFactory = (env: RdfineEnvironment) => createFactory<InstantiationExtent>([ExtentMixin, InstantiationExtentMixin], { types: [rico.InstantiationExtent] }, env)
