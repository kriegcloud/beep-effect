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

package errors

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/hashicorp/terraform-plugin-framework/diag"
	"github.com/palantir/terraform-provider-palantir-foundry/internal/provider/helper"
)

// FormatHTTPError extracts error details from an HTTP response and returns a formatted error message
func FormatHTTPError(httpResp *http.Response) (string, error) {
	if httpResp == nil {
		return "HTTP response is nil", nil
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		return fmt.Sprintf("HTTP status code: %d (failed to read body: %s)", httpResp.StatusCode, err), err
	}

	// Define error response structure to match the API format
	type ErrorResponse struct {
		ErrorCode string `json:"errorCode"`
		ErrorName string `json:"errorName"`
	}

	var errorResp ErrorResponse
	if err := json.Unmarshal(bodyBytes, &errorResp); err != nil {
		// If unmarshaling fails, return the raw body
		return fmt.Sprintf("HTTP status code: %d, body: %s", httpResp.StatusCode, string(bodyBytes)), nil
	}

	// Build detailed error message
	errMsg := fmt.Sprintf("HTTP status code: %d, errorCode: %s, errorName: %s",
		httpResp.StatusCode, errorResp.ErrorCode, errorResp.ErrorName)

	return errMsg, nil
}

func ResourceNotFoundWarning(id string, resourceType string) diag.Diagnostic {
	return diag.NewWarningDiagnostic("Resource does not exist in Foundry anymore, removing from Terraform state", "Resource ID:"+id+", Resource type: "+resourceType)
}
