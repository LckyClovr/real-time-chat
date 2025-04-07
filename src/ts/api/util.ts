import { getToken } from "../actions";
export async function fetchAPI({
  method,
  uri,
  body,
  noJson,
  noCache,
  external,
  tags,
  useRawBody,
  headers,
  params,
}: {
  method: "GET" | "POST" | "DELETE";
  uri: string;
  body?: unknown;
  noJson?: boolean;
  noCache?: boolean;
  external?: boolean;
  tags?: string[];
  useRawBody?: boolean;
  headers?: Record<string, string>;
  params?: string;
}) {
  const token = external ? undefined : await getToken();

  const url = `${process.env.NEXT_PUBLIC_HTTP_SERVER}/${formatUri(uri)}${
    params || ""
  }`;
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body: body
        ? useRawBody
          ? (body as any)
          : JSON.stringify(body)
        : undefined,
      next: noCache ? undefined : { tags: [...(tags || []), "api"] },
    });
    if (noJson) return response;

    return await response.json();
  } catch (error) {
    console.error("Error fetching API:", error);
    return undefined;
  }
}

function formatUri(uri: string) {
  return uri.split("/").filter(Boolean).join("/");
}
