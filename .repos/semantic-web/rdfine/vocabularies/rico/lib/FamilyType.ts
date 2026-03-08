import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface FamilyType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isFamilyTypeOf: Rico.Family<D> | undefined;
}

export function FamilyTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FamilyType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class FamilyTypeClass extends TypeMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Family] })
    isFamilyTypeOf: Rico.Family | undefined;
  }
  return FamilyTypeClass as any
}
FamilyTypeMixin.appliesTo = rico.FamilyType
FamilyTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<FamilyType>([TypeMixin, FamilyTypeMixin], { types: [rico.FamilyType] }, env)
