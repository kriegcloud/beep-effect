import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ConceptMixin } from './Concept.js';

export interface Type<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Concept<D>, rdfine.RdfResource<D> {
  isOrWasCategoryOf: Rico.Thing<D> | undefined;
  isOrWasCategoryOfAllMembersOf: Rico.RecordSet<D> | undefined;
  isOrWasCategoryOfSomeMembersOf: Rico.RecordSet<D> | undefined;
}

export function TypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Type & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class TypeClass extends ConceptMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    isOrWasCategoryOf: Rico.Thing | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    isOrWasCategoryOfAllMembersOf: Rico.RecordSet | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    isOrWasCategoryOfSomeMembersOf: Rico.RecordSet | undefined;
  }
  return TypeClass as any
}
TypeMixin.appliesTo = rico.Type
TypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<Type>([ConceptMixin, TypeMixin], { types: [rico.Type] }, env)
