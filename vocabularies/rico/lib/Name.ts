import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { AppellationMixin } from './Appellation.js';

export interface Name<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Appellation<D>, rdfine.RdfResource<D> {
  isOrWasNameOf: Rico.Thing<D> | undefined;
}

export function NameMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Name & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class NameClass extends AppellationMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    isOrWasNameOf: Rico.Thing | undefined;
  }
  return NameClass as any
}
NameMixin.appliesTo = rico.Name
NameMixin.createFactory = (env: RdfineEnvironment) => createFactory<Name>([AppellationMixin, NameMixin], { types: [rico.Name] }, env)
