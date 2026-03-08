import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { ParameterizableMixin } from './Parameterizable.js';

export interface ConstraintComponent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.Parameterizable<D>, rdfine.RdfResource<D> {
  nodeValidator: Sh.Validator<D> | undefined;
  propertyValidator: Sh.Validator<D> | undefined;
  validator: Sh.Validator<D> | undefined;
}

export function ConstraintComponentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ConstraintComponent & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class ConstraintComponentClass extends ParameterizableMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [sh.Validator] })
    nodeValidator: Sh.Validator | undefined;
    @rdfine.property.resource({ implicitTypes: [sh.Validator] })
    propertyValidator: Sh.Validator | undefined;
    @rdfine.property.resource({ implicitTypes: [sh.Validator] })
    validator: Sh.Validator | undefined;
  }
  return ConstraintComponentClass as any
}
ConstraintComponentMixin.appliesTo = sh.ConstraintComponent
ConstraintComponentMixin.createFactory = (env: RdfineEnvironment) => createFactory<ConstraintComponent>([ParameterizableMixin, ConstraintComponentMixin], { types: [sh.ConstraintComponent] }, env)
