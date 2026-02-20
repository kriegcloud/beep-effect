/*
 * (c) Copyright 2024 Palantir Technologies Inc. All rights reserved.
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
import React from "react";
import styles from "./DecoratorPill.module.scss";
import { OntologyCategory } from "../features/osdk/types";

type DecoratorProps = {
  category: OntologyCategory;
};

const DecoratorPill: React.FC<DecoratorProps> = ({ category }) => {
  const camelCase = (str: string) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  };

  const pillClass = camelCase(category);

  return (
    <span className={`${styles.pill} ${styles[pillClass]}`}>{category}</span>
  );
};

export default DecoratorPill;
