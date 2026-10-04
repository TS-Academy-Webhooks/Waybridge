// features/auth/auth-actions.ts
"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";
import { API_BASE_URL } from "@/lib/api-config";
import { parseApiError, type FieldErrors } from "@/lib/api-error";
import { getSafeReturnToPath } from "@/lib/auth-redirect";
import { loginFormSchema, registerFormSchema } from "@/lib/validate-auth";
import {
  BACKEND_REFRESH_COOKIE,
  BACKEND_REFRESH_COOKIE_NAME,
  getBackendRefreshToken,
  SESSION_COOKIE,
} from "@/lib/auth-constants";

export type AuthActionState = {
  message?: string;
  fieldErrors?: FieldErrors;
} | undefined;

type AuthSuccessBody = {
  success: true;
  message: string;
  data: { user: unknown; accessToken?: string; token?: string };
};

type AuthErrorBody = {
  success: false;
  message: string;
  data: null;
  errors?: { field: string; message: string }[];
};

async function postAuth(
  path: "register" | "login",
  body: Record<string, string>
): Promise<{ ok: true } | { ok: false; message: string; fieldErrors: FieldErrors }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      message: "Unable to reach the server. Please try again.",
      fieldErrors: {},
    };
  }

  const json = (await res.json().catch(() => null)) as
    | AuthSuccessBody
    | AuthErrorBody
    | null;

  if (!res.ok || !json?.success) {
    const parsed = parseApiError(res.status, json as AuthErrorBody | null);
    return { ok: false, message: parsed.message, fieldErrors: parsed.fieldErrors };
  }

  const accessToken = json.data.accessToken ?? json.data.token;
  const refreshToken = getBackendRefreshToken(res.headers.get("set-cookie"));
  if (typeof accessToken !== "string" || !accessToken || !refreshToken) {
    return {
      ok: false,
      message: "The server did not establish a complete session. Please try again.",
      fieldErrors: {},
    };
  }

  await createSession(accessToken, refreshToken);
  return { ok: true };
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerFormSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const { name, email, password } = parsed.data;
  const result = await postAuth("register", { name, email, password });
  if (!result.ok) {
    return { message: result.message, fieldErrors: result.fieldErrors };
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginFormSchema.safeParse({
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const result = await postAuth("login", parsed.data);
  if (!result.ok) {
    return { message: result.message, fieldErrors: result.fieldErrors };
  }

  redirect(getSafeReturnToPath(formData.get("next")) ?? "/dashboard");
}

export async function logoutAction() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(BACKEND_REFRESH_COOKIE)?.value;
  const accessToken = cookieStore.get(SESSION_COOKIE)?.value;

  try {
    if (refreshToken) {
      const backendCookieName = BACKEND_REFRESH_COOKIE_NAME;
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          Cookie: `${backendCookieName}=${refreshToken}`,
        },
        cache: "no-store",
      });
      if (!response.ok) {
        console.error(`Backend logout returned HTTP ${response.status}; clearing the local session.`);
      }
    }
  } catch {
    console.error("Backend logout request failed; clearing the local session.");
  } finally {
    await deleteSession();
  }
  redirect("/login");
}

function flattenZodErrors(error: {
  issues: { path: PropertyKey[]; message: string }[];
}): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
