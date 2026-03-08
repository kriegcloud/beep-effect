import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface LegalStatus<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isOrWasLegalStatusOf: Rico.Agent<D> | Rico.Record<D> | Rico.RecordPart<D> | undefined;
  isOrWasLegalStatusOfAllMembersOf: Rico.RecordSet<D> | undefined;
  isOrWasLegalStatusOfSomeMembersOf: Rico.RecordSet<D> | undefined;
}

export function LegalStatusMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LegalStatus & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class LegalStatusClass extends TypeMixin(Resource) {
    @rdfine.property.resource()
    isOrWasLegalStatusOf: Rico.Agent | Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    isOrWasLegalStatusOfAllMembersOf: Rico.RecordSet | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    isOrWasLegalStatusOfSomeMembersOf: Rico.RecordSet | undefined;
  }
  return LegalStatusClass as any
}
LegalStatusMixin.appliesTo = rico.LegalStatus
LegalStatusMixin.createFactory = (env: RdfineEnvironment) => createFactory<LegalStatus>([TypeMixin, LegalStatusMixin], { types: [rico.LegalStatus] }, env)
