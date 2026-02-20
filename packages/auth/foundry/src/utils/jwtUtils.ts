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

import type { UserId } from "@palantir/pack.auth";

/**
 * Decode a Palantir-specific JWT claim that stores UUIDs as 16-byte arrays or base64 strings.
 * These are the sub, sid, jti, and org claims.
 */
function maybeDecodeUuidClaim(value: unknown): string | undefined {
  if (typeof value === "string") {
    try {
      const decoded = atob(value);
      if (decoded.length === 16) {
        const bytes = Array.from(decoded, char => char.charCodeAt(0));
        return decodeUuidBytes(bytes);
      }
    } catch {
      return undefined;
    }
  }

  if (Array.isArray(value)) {
    if (value.length === 16 && value.every(v => typeof v === "number")) {
      return decodeUuidBytes(value);
    }
  }

  return undefined;
}

/**
 * Convert a 16-byte array to UUID string format.
 * Based on Palantir's UUID encoding format.
 */
function decodeUuidBytes(bytes: readonly number[]): string {
  if (bytes.length !== 16) {
    return "";
  }

  // Convert bytes to hex string
  const hex = bytes.map(b => b.toString(16).padStart(2, "0")).join("");

  // Format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

/**
 * Represents the parsed payload from a JWT token (unverified).
 * The information provided should not be used for security-sensitive
 * applications unless verified through some other process.
 */
export interface UnverifiedTokenInfo {
  readonly expiryInstantUtc?: number;
  readonly orgId?: string;
  readonly sessionId?: string;
  readonly tokenId?: string;
  readonly userId?: UserId;
}

/**
 * Parse JWT token to extract unverified claims including userId, sessionId, tokenId, organizationId, and expiry.
 * This does NOT verify the token signature - it only extracts payload data.
 *
 * @param token - JWT token string
 * @returns Unverified token info or undefined if parsing fails
 */
export function parseJwtToken(token: string): UnverifiedTokenInfo | undefined {
  if (!token) {
    return undefined;
  }

  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return undefined;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    if (!payload) {
      return undefined;
    }

    // Add padding if needed for base64 decoding
    const paddedPayload = payload.padEnd(payload.length + (4 - payload.length % 4) % 4, "=");

    const decoded = JSON.parse(atob(paddedPayload)) as Record<string, unknown>;

    return {
      // JWT exp is seconds since epoch, convert to ms
      expiryInstantUtc: typeof decoded.exp === "number" ? decoded.exp * 1000 : undefined,
      orgId: maybeDecodeUuidClaim(decoded.org),
      sessionId: maybeDecodeUuidClaim(decoded.sid),
      tokenId: maybeDecodeUuidClaim(decoded.jti),
      userId: maybeDecodeUuidClaim(decoded.sub),
    };
  } catch {
    return undefined;
  }
}

/**
 * Check if a JWT token is expired based on its exp claim (unverified).
 *
 * @param tokenInfo - Unverified token info
 * @returns true if token is expired, false if valid or no expiry info
 */
export function isTokenExpired(tokenInfo: UnverifiedTokenInfo): boolean {
  if (!tokenInfo.expiryInstantUtc) {
    return false; // No expiry info, assume valid
  }

  const now = Date.now();
  return tokenInfo.expiryInstantUtc < now;
}
