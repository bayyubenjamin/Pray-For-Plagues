import { NhostClient } from "@nhost/nhost-js";

const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN ?? "local";
const region = process.env.NEXT_PUBLIC_NHOST_REGION ?? "eu-central-1";

export const nhost = new NhostClient({
  subdomain,
  region,
});

export const isNhostConfigured =
  Boolean(process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN) &&
  process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN !== "local";
