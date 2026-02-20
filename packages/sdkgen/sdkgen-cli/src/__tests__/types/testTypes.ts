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

export interface TestSchema {
  version: string;
  description: string;
  types: {
    User: {
      id: string;
      name: string;
      email: string;
      createdAt: string;
    };
    Post: {
      id: string;
      title: string;
      content: string;
      authorId: string;
    };
    Comment: {
      id: string;
      postId: string;
      userId: string;
      content: string;
      createdAt: string;
    };
  };
}

export interface PackageJson {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  main?: string;
  types?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}
