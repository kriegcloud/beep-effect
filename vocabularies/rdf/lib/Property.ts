import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rdf from '../index.js';

export interface Property<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function PropertyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Property & RdfResourceCore> & Base {
  @rdfine.namespace(rdf)
  class PropertyClass extends Resource {
  }
  return PropertyClass as any
}
PropertyMixin.appliesTo = rdf.Property
PropertyMixin.createFactory = (env: RdfineEnvironment) => createFactory<Property>([PropertyMixin], { types: [rdf.Property] }, env)
