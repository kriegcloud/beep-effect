// Copyright 2025 Palantir Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package auth

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"

	"github.com/palantir/terraform-provider-palantir-foundry/internal/provider/helper"
)

type OAuth2TokenResponse struct {
	AccessToken string `json:"access_token"`
}

func GetAuthToken(multipassApiUrl string, clientID string, clientSecret string) (string, error) {

	//get the token itself
	formData := url.Values{}
	formData.Set("grant_type", "client_credentials")
	formData.Set("client_id", clientID)
	formData.Set("client_secret", clientSecret)

	encodedData := formData.Encode()

	endpoint := fmt.Sprintf("%s/oauth2/token", multipassApiUrl)

	req, err := http.NewRequest("POST", endpoint, bytes.NewBufferString(encodedData))
	if err != nil {
		fmt.Printf("Error creating request: %v\n", err)
		return "", err
	}

	// 4. Set the Content-Type header to application/x-www-form-urlencoded.
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	// 5. Create an HTTP client and send the request.
	client := &http.Client{}
	httpResp, err := client.Do(req)

	if err != nil {
		fmt.Printf("Error sending request: %v\n", err)
		return "", err
	}

	if httpResp.StatusCode != http.StatusOK {
		log.Printf("Error: received status code %d from the server\n", httpResp.StatusCode)
		return "", fmt.Errorf("received status code %d from the server", httpResp.StatusCode)
	}

	resp, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		return "", err
	}

	var httpResponseBody OAuth2TokenResponse

	if err := json.Unmarshal(resp, &httpResponseBody); err != nil {
		log.Printf("Error unmarshalling response: %v\n", err)
		return "", err
	}

	return httpResponseBody.AccessToken, nil

}
