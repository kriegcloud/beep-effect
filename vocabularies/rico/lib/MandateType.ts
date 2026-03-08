import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { RuleTypeMixin } from './RuleType.js';

export interface MandateType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.RuleType<D>, rdfine.RdfResource<D> {
  isOrWasMandateTypeOf: Rico.Mandate<D> | undefined;
}

export function MandateTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MandateType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class MandateTypeClass extends RuleTypeMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Mandate] })
    isOrWasMandateTypeOf: Rico.Mandate | undefined;
  }
  return MandateTypeClass as any
}
MandateTypeMixin.appliesTo = rico.MandateType
MandateTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<MandateType>([RuleTypeMixin, MandateTypeMixin], { types: [rico.MandateType] }, env)
