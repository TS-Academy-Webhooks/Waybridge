// lib/api-error.ts
// Framework-agnostic parsing of the backend's error envelope:
//   { success: false, message: string, data: null, errors?: { field, message }[] }
// Ported from the old SPA's utils/apiError.js, adapted for fetch Response
// objects instead of axios errors, since the server-side data layer uses fetch.

export type FieldErrors = Record<string, string>;

export type ParsedApiError = {
  message: string;
  fieldErrors: FieldErrors;
  status: number;
};

type BackendErrorBody = {
  success?: boolean;
  message?: string;
  data?: unknown;
  errors?: { field: string; message: string }[];
};

function toFieldErrors(errors: BackendErrorBody["errors"]): FieldErrors {
  if (!Array.isArray(errors)) return {};
  return errors.reduce<FieldErrors>((acc, entry) => {
    if (entry?.field && entry?.message) {
      acc[entry.field] = entry.message;
    }
    return acc;
  }, {});
}

// Call with a Response whose body has already been read as JSON (or null if
// the body couldn't be parsed as JSON at all).
export function parseApiError(
  status: number,
  body: BackendErrorBody | null
): ParsedApiError {
  return {
    status,
    message: body?.message ?? "Something went wrong. Please try again.",
    fieldErrors: toFieldErrors(body?.errors),
  };
}
