import type * as RDF from '@rdfjs/types';
import type { IItemScope } from '../IItemScope';
import type { Util } from '../Util';
import type { IItemPropertyHandler } from './IItemPropertyHandler';

/**
 * Handler for an item property with the 'content' attribute.
 */
export class ItemPropertyHandlerContent implements IItemPropertyHandler {
  public canHandle(tagName: string, attributes: Record<string, string>): boolean {
    return 'content' in attributes;
  }

  public getObject(attributes: Record<string, string>, util: Util, itemScope: IItemScope): RDF.Quad_Object {
    return util.createLiteral(attributes.content, itemScope);
  }
}
