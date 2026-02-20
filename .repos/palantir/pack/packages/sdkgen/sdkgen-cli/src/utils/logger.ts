/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { type ConsolaInstance, createConsola } from "consola";

export class Logger {
  private consola: ConsolaInstance;

  constructor(verbose: boolean = false) {
    this.consola = createConsola({
      level: verbose ? 4 : 3,
    });
  }

  info(message: string): void {
    this.consola.info(message);
  }

  success(message: string): void {
    this.consola.success(message);
  }

  warning(message: string): void {
    this.consola.warn(message);
  }

  error(message: string): void {
    this.consola.error(message);
  }

  debug(message: string): void {
    this.consola.debug(message);
  }

  log(message: string): void {
    this.consola.log(message);
  }
}
