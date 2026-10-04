const INTERNAL_ORIGIN = "https://chadman.invalid";

export function getSafeReturnToPath(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return null;
  }

  try {
    const url = new URL(value, INTERNAL_ORIGIN);
    if (
      url.origin !== INTERNAL_ORIGIN ||
      url.pathname === "/login" ||
      url.pathname === "/signup"
    ) {
      return null;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
