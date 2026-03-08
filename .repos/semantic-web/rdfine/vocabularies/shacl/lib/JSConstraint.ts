import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { JSExecutableMixin } from './JSExecutable.js';

export interface JSConstraint<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.JSExecutable<D>, rdfine.RdfResource<D> {
}

export function JSConstraintMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<JSConstraint & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class JSConstraintClass extends JSExecutableMixin(Resource) {
  }
  return JSConstraintClass as any
}
JSConstraintMixin.appliesTo = sh.JSConstraint
JSConstraintMixin.createFactory = (env: RdfineEnvironment) => createFactory<JSConstraint>([JSExecutableMixin, JSConstraintMixin], { types: [sh.JSConstraint] }, env)
