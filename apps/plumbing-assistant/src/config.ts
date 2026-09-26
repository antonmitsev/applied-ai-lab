export type NodeEnvironment = "development" | "test" | "production";
export type ProviderMode = "mock" | "external";

export interface AppConfig {
  port: number;
  nodeEnv: NodeEnvironment;
  providerMode: ProviderMode;
  maxRequestBytes: number;
  maxProviderCallsPerRequest: number;
}

function parseInteger(name: string, rawValue: string | undefined, defaultValue: number): number {
  const value = rawValue === undefined ? defaultValue : Number(rawValue);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return value;
}

function parsePort(rawValue: string | undefined): number {
  const value = rawValue === undefined ? 3000 : Number(rawValue);
  if (!Number.isInteger(value) || value < 1 || value > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return value;
}

function parseMockProvider(rawValue: string | undefined): boolean {
  if (rawValue === undefined || rawValue === "true") return true;
  if (rawValue === "false") return false;
  throw new Error("MOCK_PROVIDER must be true or false");
}

function parseNodeEnvironment(rawValue: string | undefined): NodeEnvironment {
  const value = rawValue ?? "development";
  if (value === "development" || value === "test" || value === "production") return value;
  throw new Error("NODE_ENV must be development, test, or production");
}

export function parseConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  const mockProvider = parseMockProvider(environment.MOCK_PROVIDER);
  return {
    port: parsePort(environment.PORT),
    nodeEnv: parseNodeEnvironment(environment.NODE_ENV),
    providerMode: mockProvider ? "mock" : "external",
    maxRequestBytes: parseInteger("MAX_REQUEST_BYTES", environment.MAX_REQUEST_BYTES, 32_768),
    maxProviderCallsPerRequest: parseInteger(
      "MAX_PROVIDER_CALLS_PER_REQUEST",
      environment.MAX_PROVIDER_CALLS_PER_REQUEST,
      1,
    ),
  };
}
