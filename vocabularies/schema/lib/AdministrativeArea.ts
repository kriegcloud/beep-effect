import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlaceMixin } from './Place.js';

export interface AdministrativeArea<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Place<D>, rdfine.RdfResource<D> {
}

export function AdministrativeAreaMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AdministrativeArea & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AdministrativeAreaClass extends PlaceMixin(Resource) {
  }
  return AdministrativeAreaClass as any
}
AdministrativeAreaMixin.appliesTo = schema.AdministrativeArea
AdministrativeAreaMixin.createFactory = (env: RdfineEnvironment) => createFactory<AdministrativeArea>([PlaceMixin, AdministrativeAreaMixin], { types: [schema.AdministrativeArea] }, env)
