import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { GroupMixin } from './Group.js';

export interface CorporateBody<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Group<D>, rdfine.RdfResource<D> {
  hasOrHadCorporateBodyType: Rico.CorporateBodyType<D> | undefined;
  isOrWasEmployerOf: Rico.Person<D> | undefined;
  resultedFromTheMergerOf: Rico.CorporateBody<D> | undefined;
  resultedFromTheSplitOf: Rico.CorporateBody<D> | undefined;
  wasMergedInto: Rico.CorporateBody<D> | undefined;
  wasSplitInto: Rico.CorporateBody<D> | undefined;
}

export function CorporateBodyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CorporateBody & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class CorporateBodyClass extends GroupMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.CorporateBodyType] })
    hasOrHadCorporateBodyType: Rico.CorporateBodyType | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Person] })
    isOrWasEmployerOf: Rico.Person | undefined;
    @rdfine.property.resource({ as: [CorporateBodyMixin] })
    resultedFromTheMergerOf: Rico.CorporateBody | undefined;
    @rdfine.property.resource({ as: [CorporateBodyMixin] })
    resultedFromTheSplitOf: Rico.CorporateBody | undefined;
    @rdfine.property.resource({ as: [CorporateBodyMixin] })
    wasMergedInto: Rico.CorporateBody | undefined;
    @rdfine.property.resource({ as: [CorporateBodyMixin] })
    wasSplitInto: Rico.CorporateBody | undefined;
  }
  return CorporateBodyClass as any
}
CorporateBodyMixin.appliesTo = rico.CorporateBody
CorporateBodyMixin.createFactory = (env: RdfineEnvironment) => createFactory<CorporateBody>([GroupMixin, CorporateBodyMixin], { types: [rico.CorporateBody] }, env)
