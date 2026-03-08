import type * as RDF from '@rdfjs/types';
import type { IItemScope } from '../IItemScope';
import { Util } from '../Util';
import type { IItemPropertyHandler } from './IItemPropertyHandler';

/**
 * Handler for an item property for time tags.
 */
export class ItemPropertyHandlerTime implements IItemPropertyHandler {
  private static readonly TIME_REGEXES: { regex: RegExp; type: string }[] = [
    {
      regex: /^-?P(\d+Y)?(\d+M)?(\d+D)?(T(\d+H)?(\d+M)?(\d+(\.\d)?S)?)?$/u,
      type: 'duration',
    },
    {
      regex: /^\d+-\d\d-\d\dT\d\d:\d\d:\d\d((Z?)|([+-]\d\d:\d\d))$/u,
      type: 'dateTime',
    },
    { regex: /^\d+-\d\d-\d\dZ?$/u, type: 'date' },
    { regex: /^\d\d:\d\d:\d\d((Z?)|([+-]\d\d:\d\d))$/u, type: 'time' },
    { regex: /^\d+-\d\d$/u, type: 'gYearMonth' },
    { regex: /^\d+$/u, type: 'gYear' },
  ];

  public canHandle(tagName: string, attributes: Record<string, string>): boolean {
    return tagName === 'time' && 'datetime' in attributes;
  }

  public getObject(attributes: Record<string, string>, util: Util, itemScope: IItemScope): RDF.Quad_Object {
    const value = attributes.datetime;
    let datatype: RDF.NamedNode | undefined;
    for (const entry of ItemPropertyHandlerTime.TIME_REGEXES) {
      if (entry.regex.test(value)) {
        datatype = util.dataFactory.namedNode(Util.XSD + entry.type);
        break;
      }
    }
    return util.dataFactory.literal(value, datatype);
  }
}
