import "server-only";
import { API_BASE_URL } from "@/lib/api-config";

export function getSwaggerDocsUrl(): string {
  return new URL("/docs", API_BASE_URL).toString();
}
