import { createClient } from "@nhost/nhost-js";

export const nhostSubdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN ?? "";
export const nhostRegion = process.env.NEXT_PUBLIC_NHOST_REGION ?? "eu-central-1";

export const isNhostConfigured = Boolean(nhostSubdomain);

export const nhostGraphqlUrl =
  process.env.NHOST_GRAPHQL_URL ||
  process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL ||
  (nhostSubdomain
    ? `https://${nhostSubdomain}.hasura.${nhostRegion}.nhost.run/v1/graphql`
    : "");

export const nhost = createClient({
  subdomain: nhostSubdomain || "local",
  region: nhostRegion,
});

export const OPENSEA_COLLECTION_URL =
  process.env.NEXT_PUBLIC_OPENSEA_URL ?? "https://opensea.io";
