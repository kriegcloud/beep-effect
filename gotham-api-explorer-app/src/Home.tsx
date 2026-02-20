/*
 * (c) Copyright 2025 Palantir Technologies Inc. All rights reserved.
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
import { useEffect } from "react";
import { auth } from "./client";
import yaml from "js-yaml";
import styles from "./Home.module.scss";
import Header from "./Header";
import EndpointList from "./EndpointList";
import MainContent from "./MainContent";
import ContentList from "./ContentList";
import {
  setOpenapiDefinition,
} from "./features/form/slice"
import { useDispatch } from "react-redux";

const url = import.meta.env.VITE_FOUNDRY_API_URL;


function Home() {
  const dispatch = useDispatch();
  auth.signIn();

  useEffect(() => {
    // Fetch and load the Gotham OpenAPI endpoint definitions from the stack
    const fetchOpenAPIDefinition = async () => {
      try {
        const TOKEN = (await auth.refresh())?.access_token;
        const response = await fetch(
          url + "/api/gotham/openapi", // Should be consistent across all stacks if exists
          {
            headers: {
              Authorization: `Bearer ${TOKEN}`,
            },
          }
        );
        const text = await response.text();
        const data = yaml.load(text);
        dispatch(setOpenapiDefinition(data));
      } catch (error) {
        console.error("Error fetching OpenAPI definition:", error);
      }
    };

    fetchOpenAPIDefinition();
  }, []);

  return (
    <div className={styles.appContainer}>
      <Header />
      <div className={styles.content}>
        <EndpointList />
        <MainContent />
        <ContentList />
      </div>
    </div>
  );
  
}

export default Home;
