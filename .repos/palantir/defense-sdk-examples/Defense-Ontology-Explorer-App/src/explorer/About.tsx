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
import { Icon, IconName } from "@blueprintjs/core";
import styles from "./About.module.scss";

const features = [
  {
    icon: "graph" as IconName,
    title: "Abstract Data Model",
    description:
      "The Defense Ontology primarily consists of abstract types that can be applied to concrete data in Foundry environments.",
  },
  {
    icon: "cog" as IconName,
    title: "API-like Functionality",
    description:
      "When abstract types are applied to Foundry data, the Defense Ontology effectively functions as an API, allowing for build-once, deploy-anywhere capabilities across different environments and networks.",
  },
  {
    icon: "book" as IconName,
    title: "Doctrine-Inspired Design",
    description:
      "The ontology structure is inspired by established military doctrine, particularly the CJADC2 warfighting functions.",
  },
  {
    icon: "target" as IconName,
    title: "Built on Real-World Experience",
    description:
      "The Defense Ontology incorporates lessons learned and best practices from numerous DOD programs, including Maven, Vantage, AIDP, Titan, and others.",
  },
  {
    icon: "tick-circle" as IconName,
    title: "Cross-Program Compatibility",
    description:
      "Designed to be compatible with all major DOD program work, ensuring consistency and interoperability.",
  },
];

const About: React.FC = () => {
  return (
    <div className={styles.aboutContent}>
      {features.map((feature, index) => (
        <div key={index} className={styles.feature}>
          <div className={styles.titleRow}>
            <Icon icon={feature.icon} className={styles.icon} />
            <p className={styles.title}>{feature.title}</p>
          </div>
          <p className={styles.description}>{feature.description}</p>
        </div>
      ))}
    </div>
  );
};

export default About;
