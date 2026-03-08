import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface IdentifierType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isIdentifierTypeOf: Rico.Identifier<D> | undefined;
}

export function IdentifierTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<IdentifierType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class IdentifierTypeClass extends TypeMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Identifier] })
    isIdentifierTypeOf: Rico.Identifier | undefined;
  }
  return IdentifierTypeClass as any
}
IdentifierTypeMixin.appliesTo = rico.IdentifierType
IdentifierTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<IdentifierType>([TypeMixin, IdentifierTypeMixin], { types: [rico.IdentifierType] }, env)
