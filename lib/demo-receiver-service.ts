import "server-only";
import { authFetch, buildQuery } from "./server-fetch";
import type { Pagination } from "./webhook-service";

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export type DemoReceiverSignature = {
  valid: boolean | null;
  status: "valid" | "invalid" | "missing";
  scheme: "timestamped" | "legacy" | "unknown" | null;
  timestampFresh: boolean | null;
};

export type DemoReceiverRequest = {
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  rawBody: string;
  bodyTruncated: boolean;
  timestamp: string;
  eventType: string | null;
  signatureValid: boolean | null;
  signature: DemoReceiverSignature;
};

export type DemoReceiverResponseProfile = {
  statusCode: number;
  body?: JsonValue;
};

export type DemoReceiverConfiguration = {
  success: DemoReceiverResponseProfile;
  failure: DemoReceiverResponseProfile;
};

export type DemoReceiverConfigurationUpdate = {
  success?: DemoReceiverResponseProfile;
  failure?: DemoReceiverResponseProfile;
};

export type DemoReceiverHistoryParams = {
  page?: number;
  limit?: number;
  signatureValid?: "true" | "false" | "unknown";
  event?: string;
};

export async function getDemoReceiverHistory(
  params: DemoReceiverHistoryParams = {}
): Promise<{ items: DemoReceiverRequest[]; pagination: Pagination }> {
  const query = buildQuery(params);
  return authFetch(`/demo-receiver${query}`);
}

export async function clearDemoReceiverHistory(): Promise<{ clearedCount: number }> {
  return authFetch("/demo-receiver", { method: "DELETE" });
}

export async function getDemoReceiverConfiguration(): Promise<DemoReceiverConfiguration> {
  return authFetch("/demo-receiver/config");
}

export async function updateDemoReceiverConfiguration(
  input: DemoReceiverConfigurationUpdate
): Promise<DemoReceiverConfiguration> {
  return authFetch("/demo-receiver/config", { method: "PATCH", body: input });
}

export async function resetDemoReceiverConfiguration(): Promise<DemoReceiverConfiguration> {
  return authFetch("/demo-receiver/config", { method: "DELETE" });
}
