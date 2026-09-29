// features/auth/auth-actions.ts
"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";
import { API_BASE_URL } from "@/lib/api-config";
import { parseApiError, type FieldErrors } from "@/lib/api-error";
import { loginFormSchema, registerFormSchema } from "@/lib/validate-auth";

export type AuthActionState = {
  message?: string;
  fieldErrors?: FieldErrors;
} | undefined;

type AuthSuccessBody = {
  success: true;
  message: string;
  data: { user: unknown; token: string };
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

  await createSession(json.data.token);
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

  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSession();
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
