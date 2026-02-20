import * as fs from "fs";
import { FoundryService, getFoundryServices } from "../getFoundryServices";

// Mocking the fs module
jest.mock("fs");

describe("getFoundryServices", () => {
  const mockYamlContent = `
    stream_proxy:
      - "https://stream-proxy.example.com"
    api_gateway:
      - "https://api-gateway.example.com"
    foundry_mio:
      - "https://mio.example.com"
    `;

  beforeEach(() => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => mockYamlContent);
    process.env["FOUNDRY_SERVICE_DISCOVERY_V2"] =
      "mock/path/to/service-discovery.yaml";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should parse the YAML and return the services", () => {
    const services = getFoundryServices();

    expect(fs.readFileSync).toHaveBeenCalledWith(
      "mock/path/to/service-discovery.yaml",
      "utf-8"
    );
    expect(services).toEqual({
      [FoundryService.STREAM_PROXY]: "https://stream-proxy.example.com",
      [FoundryService.API_GATEWAY]: "https://api-gateway.example.com",
      [FoundryService.MIO]: "https://mio.example.com",
    });
  });

  it("should return cached services on subsequent calls", () => {
    // Subsequent call should use the cached services
    const services = getFoundryServices();

    expect(fs.readFileSync).toHaveBeenCalledTimes(0);
    expect(services).toEqual({
      [FoundryService.STREAM_PROXY]: "https://stream-proxy.example.com",
      [FoundryService.API_GATEWAY]: "https://api-gateway.example.com",
      [FoundryService.MIO]: "https://mio.example.com",
    });
  });
});
