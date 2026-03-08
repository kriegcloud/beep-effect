import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { NameMixin } from './Name.js';

export interface Title<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Name<D>, rdfine.RdfResource<D> {
  isOrWasTitleOf: Rico.Instantiation<D> | Rico.RecordResource<D> | Rico.Rule<D> | undefined;
}

export function TitleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Title & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class TitleClass extends NameMixin(Resource) {
    @rdfine.property.resource()
    isOrWasTitleOf: Rico.Instantiation | Rico.RecordResource | Rico.Rule | undefined;
  }
  return TitleClass as any
}
TitleMixin.appliesTo = rico.Title
TitleMixin.createFactory = (env: RdfineEnvironment) => createFactory<Title>([NameMixin, TitleMixin], { types: [rico.Title] }, env)
