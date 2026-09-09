import { nhostGraphqlUrl } from "./nhost";

export async function nhostAdminRequest<T>(query: string, variables: Record<string, unknown>) {
  const secret = process.env.NHOST_ADMIN_SECRET;
  if (!nhostGraphqlUrl) {
    throw new Error("Nhost GraphQL URL missing. Set NEXT_PUBLIC_NHOST_SUBDOMAIN + REGION.");
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (secret) headers["x-hasura-admin-secret"] = secret;

  const res = await fetch(nhostGraphqlUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (!res.ok || json.errors?.length) {
    throw new Error(json.errors?.map((e) => e.message).join("; ") || `HTTP ${res.status}`);
  }
  return json.data as T;
}
