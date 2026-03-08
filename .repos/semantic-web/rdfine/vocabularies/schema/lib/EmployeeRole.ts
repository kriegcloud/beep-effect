import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationRoleMixin } from './OrganizationRole.js';

export interface EmployeeRole<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.OrganizationRole<D>, rdfine.RdfResource<D> {
  baseSalary: Schema.MonetaryAmount<D> | Schema.PriceSpecification<D> | undefined;
  baseSalaryLiteral: number | undefined;
  salaryCurrency: string | undefined;
}

export function EmployeeRoleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EmployeeRole & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EmployeeRoleClass extends OrganizationRoleMixin(Resource) {
    @rdfine.property.resource()
    baseSalary: Schema.MonetaryAmount | Schema.PriceSpecification | undefined;
    @rdfine.property.literal({ path: schema.baseSalary, type: Number })
    baseSalaryLiteral: number | undefined;
    @rdfine.property.literal()
    salaryCurrency: string | undefined;
  }
  return EmployeeRoleClass as any
}
EmployeeRoleMixin.appliesTo = schema.EmployeeRole
EmployeeRoleMixin.createFactory = (env: RdfineEnvironment) => createFactory<EmployeeRole>([OrganizationRoleMixin, EmployeeRoleMixin], { types: [schema.EmployeeRole] }, env)
