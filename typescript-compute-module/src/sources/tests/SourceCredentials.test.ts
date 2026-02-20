import { Logger } from "../../logger";
import { SourceCredentials, SourceCredentialsFile } from "../SourceCredentials";
import * as fs from "fs";

// Mock the cacheReadFileSync function
jest.mock("fs");

describe("SourceCredentials", () => {
  const mockCredentialPath = "/path/to/credentials.json";
  let mockCredentials: SourceCredentialsFile;

  beforeEach(() => {
    mockCredentials = {
      api1: { key1: "value1", key2: "value2" },
      api2: { key1: "value3" },
    };

    (fs.readFileSync as jest.Mock).mockImplementation(() =>
      JSON.stringify(mockCredentials)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the correct credential for a given source and credential name", () => {
    const sourceCredentials = new SourceCredentials(mockCredentialPath);
    const credential = sourceCredentials.getCredential("api1", "key1");
    expect(credential).toBe("value1");
  });

  it("should return null if the source does not exist", () => {
    const sourceCredentials = new SourceCredentials(mockCredentialPath);
    const credential = sourceCredentials.getCredential(
      "nonexistentApi",
      "key1"
    );
    expect(credential).toBeNull();
  });

  it("should return null if the credential name does not exist for a given source", () => {
    const sourceCredentials = new SourceCredentials(mockCredentialPath);
    const credential = sourceCredentials.getCredential(
      "api1",
      "nonexistentKey"
    );
    expect(credential).toBeNull();
  });

  it("should only call fs.readFileSync once and cache the result", () => {
    const sourceCredentials = new SourceCredentials(mockCredentialPath);
    sourceCredentials.getCredential("api1", "key1");
    sourceCredentials.getCredential("api1", "key2");
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
  });

  it("should log all the credentials without passwords", () => {
    const mockLogger = {
      log: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    } as Logger;
    const sourceCredentials = new SourceCredentials(
      mockCredentialPath,
      mockLogger
    );
    sourceCredentials.getCredential("api1", "key1");
    sourceCredentials.getCredential("api1", "key2");

    expect(mockLogger.log).toHaveBeenCalledTimes(1);
    const loggedMessage = (mockLogger.log as jest.Mock).mock.calls[0][0];
    expect(loggedMessage).toContain("Loaded credentials");

    expect(loggedMessage).toContain("api1");
    expect(loggedMessage).toContain("key1");
    expect(loggedMessage).not.toContain("value");
  });
});
