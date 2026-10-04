"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SESSION_REFRESH_MARGIN_MS } from "@/lib/auth-constants";

const ACTIVE_WINDOW_MS = 10 * 60 * 1000;
const INITIAL_RETRY_MS = 30 * 1000;
const MAX_RETRY_MS = 5 * 60 * 1000;
const REFRESH_LOCK_NAME = "chadman-session-refresh";

type RefreshAttempt =
  | { status: number; ok: false }
  | { status: number; ok: true; body: unknown }
  | { status: number; ok: true; error: unknown };

let pendingRefresh: Promise<RefreshAttempt> | null = null;

function requestSessionRefresh(): Promise<RefreshAttempt> {
  if (pendingRefresh) return pendingRefresh;

  const sendRequest = () =>
    fetch("/api/session/refresh", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });

  const request = async (): Promise<RefreshAttempt> => {
    const response = navigator.locks
      ? await navigator.locks.request(REFRESH_LOCK_NAME, sendRequest)
      : await sendRequest();

    if (!response.ok) return { status: response.status, ok: false };
    try {
      return {
        status: response.status,
        ok: true,
        body: await response.json(),
      };
    } catch (error) {
      return { status: response.status, ok: true, error };
    }
  };

  pendingRefresh = request().finally(() => {
    pendingRefresh = null;
  });
  return pendingRefresh;
}

export function SessionRefresh({ expiresAt }: { expiresAt: number | null }) {
  const router = useRouter();
  const expiresAtRef = useRef(expiresAt);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let inFlight = false;
    let disposed = false;
    let retryDelay = INITIAL_RETRY_MS;
    let lastActivityAt = Date.now();

    function isActive() {
      return (
        document.visibilityState === "visible" &&
        Date.now() - lastActivityAt <= ACTIVE_WINDOW_MS
      );
    }

    function schedule(delay?: number) {
      if (timer) clearTimeout(timer);
      if (!isActive()) return;

      const expiryDelay =
        expiresAtRef.current === null
          ? 0
          : Math.max(
              0,
              expiresAtRef.current -
                Date.now() -
                SESSION_REFRESH_MARGIN_MS +
                1000
            );
      timer = setTimeout(() => {
        void refreshSession();
      }, delay ?? expiryDelay);
    }

    function retry(error: unknown) {
      console.error("Session refresh failed; it will be retried.", error);
      const delay = retryDelay;
      retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS);
      schedule(delay);
    }

    async function refreshSession() {
      if (disposed || inFlight || !isActive()) return;
      inFlight = true;

      try {
        const result = await requestSessionRefresh();
        if (disposed) return;

        if (result.status === 401) {
          const next = `${window.location.pathname}${window.location.search}`;
          router.replace(`/login?next=${encodeURIComponent(next)}`);
          return;
        }
        if (!result.ok) {
          retry(new Error(`Session refresh returned HTTP ${result.status}.`));
          return;
        }
        if ("error" in result) {
          retry(result.error);
          return;
        }
        if (
          !isRecord(result.body) ||
          typeof result.body.expiresAt !== "number" ||
          !Number.isSafeInteger(result.body.expiresAt) ||
          result.body.expiresAt <= Date.now()
        ) {
          retry(new Error("The session refresh response was invalid."));
          return;
        }

        expiresAtRef.current = result.body.expiresAt;
        retryDelay = INITIAL_RETRY_MS;
        schedule();
      } catch (error) {
        if (!disposed) retry(error);
      } finally {
        inFlight = false;
      }
    }

    function recordActivity() {
      lastActivityAt = Date.now();
      schedule();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        schedule();
      } else if (timer) {
        clearTimeout(timer);
      }
    }

    const activityEvents: (keyof WindowEventMap)[] = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    for (const eventName of activityEvents) {
      window.addEventListener(eventName, recordActivity, { passive: true });
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    schedule();

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, recordActivity);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
