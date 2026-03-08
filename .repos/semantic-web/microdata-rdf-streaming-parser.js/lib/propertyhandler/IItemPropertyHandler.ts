import type * as RDF from '@rdfjs/types';
import type { IItemScope } from '../IItemScope';
import type { Util } from '../Util';

/**
 * Interface for handling special types of item properties.
 */
export interface IItemPropertyHandler {
  canHandle: (tagName: string, attributes: Record<string, string>) => boolean;
  getObject: (attributes: Record<string, string>, util: Util, itemScope: IItemScope) => RDF.Quad_Object;
}
