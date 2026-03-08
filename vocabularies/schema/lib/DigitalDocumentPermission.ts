import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface DigitalDocumentPermission<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  grantee: Schema.Audience<D> | Schema.ContactPoint<D> | Schema.Organization<D> | Schema.Person<D> | undefined;
  permissionType: Schema.DigitalDocumentPermissionType | undefined;
}

export function DigitalDocumentPermissionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DigitalDocumentPermission & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DigitalDocumentPermissionClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    grantee: Schema.Audience | Schema.ContactPoint | Schema.Organization | Schema.Person | undefined;
    @rdfine.property()
    permissionType: Schema.DigitalDocumentPermissionType | undefined;
  }
  return DigitalDocumentPermissionClass as any
}
DigitalDocumentPermissionMixin.appliesTo = schema.DigitalDocumentPermission
DigitalDocumentPermissionMixin.createFactory = (env: RdfineEnvironment) => createFactory<DigitalDocumentPermission>([IntangibleMixin, DigitalDocumentPermissionMixin], { types: [schema.DigitalDocumentPermission] }, env)
