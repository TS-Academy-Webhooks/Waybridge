export { cn } from "cn"

type PropertyOrValue<T, K extends PropertyKey> = T extends object
  ? K extends keyof T
    ? T[K]
    : T
  : T;

export function getPropertyOrValue<T, K extends PropertyKey>(
  value: T,
  key: K,
): PropertyOrValue<T, K> {
  if (typeof value === "object" && value !== null && key in value) {
    return (value as Record<K, unknown>)[key] as PropertyOrValue<T, K>;
  }

  return value as PropertyOrValue<T, K>;
}
