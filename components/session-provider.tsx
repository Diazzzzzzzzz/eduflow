"use client";

import * as React from "react";
import type { Role } from "@/lib/auth-routes";

/**
 * The signed-in user, as resolved on the server, made readable to client
 * components.
 *
 * Deliberately exposes NO setter. The role is decided once per request from
 * the session cookie in `getUserProfile()`; navigating to a page that happens
 * to live under another role's URL prefix must never change who you are. A
 * writable context here would make that failure possible, so there isn't one —
 * to change role you sign in as somebody else.
 */
export interface SessionUser {
  email: string;
  role: Role;
  fullName: string;
}

const SessionContext = React.createContext<SessionUser | null>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  // `user` is a fresh object per server render; memoise on its fields so
  // consumers don't re-render on every parent render.
  const value = React.useMemo(
    () => user,
    [user.email, user.role, user.fullName] // eslint-disable-line react-hooks/exhaustive-deps
  );
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/** The current user. Only valid inside the authenticated (app) layout. */
export function useSession(): SessionUser {
  const ctx = React.useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used inside <SessionProvider>");
  }
  return ctx;
}

/** First name for greetings, falling back to the email local part. */
export function firstNameOf(user: SessionUser): string {
  const base = user.fullName.trim() || user.email.split("@")[0] || "";
  return base.split(/\s+/)[0] ?? "";
}
