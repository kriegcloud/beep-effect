/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { BaseApi } from './baseApi.js'
import { HttpRequestContext } from './httpRequestContext.js'

export class AuthoringApi extends BaseApi {
  constructor(context: HttpRequestContext) {
    super(context, 'code/api', 'authoringService')
  }
  async retrieveToken(secret: string): Promise<string | undefined> {
    return this.post<string | undefined>('security/token/retrieve', 'retrieveToken', secret)
  }
}
