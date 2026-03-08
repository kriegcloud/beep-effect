import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { AppellationMixin } from './Appellation.js';

export interface Identifier<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Appellation<D>, rdfine.RdfResource<D> {
  hasIdentifierType: Rico.IdentifierType<D> | undefined;
  isOrWasIdentifierOf: Rico.Thing<D> | undefined;
}

export function IdentifierMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Identifier & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class IdentifierClass extends AppellationMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.IdentifierType] })
    hasIdentifierType: Rico.IdentifierType | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    isOrWasIdentifierOf: Rico.Thing | undefined;
  }
  return IdentifierClass as any
}
IdentifierMixin.appliesTo = rico.Identifier
IdentifierMixin.createFactory = (env: RdfineEnvironment) => createFactory<Identifier>([AppellationMixin, IdentifierMixin], { types: [rico.Identifier] }, env)
