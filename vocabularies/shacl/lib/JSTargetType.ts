import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { JSExecutableMixin } from './JSExecutable.js';
import { TargetTypeMixin } from './TargetType.js';

export interface JSTargetType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.JSExecutable<D>, Sh.TargetType<D>, rdfine.RdfResource<D> {
}

export function JSTargetTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<JSTargetType & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class JSTargetTypeClass extends TargetTypeMixin(JSExecutableMixin(Resource)) {
  }
  return JSTargetTypeClass as any
}
JSTargetTypeMixin.appliesTo = sh.JSTargetType
JSTargetTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<JSTargetType>([TargetTypeMixin, JSExecutableMixin, JSTargetTypeMixin], { types: [sh.JSTargetType] }, env)
