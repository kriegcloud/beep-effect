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
import { glob } from "glob";
import fs from "fs-extra";

const copyright = `/*
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
`;

const filePatterns = [
  "src/**/*.tsx",
  "src/**/*.ts",
  "src/**/*.scss",
  "src/**/*.css",
  "src/**/*.js",
];

const mode = process.argv[2];

if (!mode || (mode !== "add" && mode !== "check")) {
  console.error("Please provide a valid mode: 'add' or 'check'");
  process.exit(1);
}

async function processFiles() {
  for (const pattern of filePatterns) {
    try {
      const files = await glob(pattern);
      files.forEach((file) => {
        const content = fs.readFileSync(file, "utf8");
        const hasCopyright = content.startsWith(copyright);

        if (mode === "add" && !hasCopyright) {
          fs.writeFileSync(file, copyright + content);
          console.log(`Copyright added to: ${file}`);
        } else if (mode === "check" && !hasCopyright) {
          console.log(`Missing copyright: ${file}`);
        }
      });
    } catch (err) {
      console.error(`Error processing pattern ${pattern}:`, err);
    }
  }
}

processFiles();
