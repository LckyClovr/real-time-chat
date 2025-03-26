"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function setTokenCookie(token: string, wsToken: string) {
  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  cookieStore.set("ws-token", wsToken, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function setLoginAttemptCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set("login-attempt", token, {
    path: "/",
    maxAge: 60 * 60,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
}

export async function deleteTokenCookie() {
  const cookieStore = await cookies();

  cookieStore.delete("token");
}

export async function getToken() {
  const cookieStore = await cookies();

  const tokenCookie = cookieStore.get("token");
  if (tokenCookie && tokenCookie.value) return tokenCookie.value;
  return "";
}

export async function getWsToken() {
  const cookieStore = await cookies();

  const tokenCookie = cookieStore.get("ws-token");
  if (tokenCookie && tokenCookie.value) return tokenCookie.value;
  return "";
}

export async function getLoginAttempt() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("login-attempt");
  if (tokenCookie && tokenCookie.value) return tokenCookie.value;
  return "";
}

export async function invalidateAPI(tag?: string) {
  // console.log('Invalidating API cache for tag:', tag);
  revalidateTag(tag || "api");
}
