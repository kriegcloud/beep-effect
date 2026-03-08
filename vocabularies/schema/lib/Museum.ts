import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface Museum<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function MuseumMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Museum & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MuseumClass extends CivicStructureMixin(Resource) {
  }
  return MuseumClass as any
}
MuseumMixin.appliesTo = schema.Museum
MuseumMixin.createFactory = (env: RdfineEnvironment) => createFactory<Museum>([CivicStructureMixin, MuseumMixin], { types: [schema.Museum] }, env)
