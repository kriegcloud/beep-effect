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

import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [basicSsl(), react()],
  base: process.env.NODE_ENV === "development" ? process.env.DEV_SERVER_BASE_PATH : undefined,
  server: {
    host: process.env.DEV_SERVER_HOST,
    port: Number(process.env.DEV_SERVER_PORT ?? 5173),
    proxy: {
      "^(/api/v2)": {
        target: process.env.VITE_FOUNDRY_API_URL,
        changeOrigin: true,
        secure: true,
        ws: true,
      },
    },
  },
  resolve: {
    dedupe: ["@osdk/client", "@osdk/api", "@demo/canvas.sdk"],
  },
});
