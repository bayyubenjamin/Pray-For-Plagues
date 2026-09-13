import { nhostAdminRequest } from "./nhost-server";

const UPSERT_FULL = `
  mutation UpsertProfile(
    $x_handle: String!,
    $wallet: String,
    $email: String,
    $connected_wallet: String,
    $points: Int!
  ) {
    insert_profiles_one(
      object: {
        x_handle: $x_handle,
        wallet: $wallet,
        email: $email,
        connected_wallet: $connected_wallet,
        points: $points
      }
      on_conflict: {
        constraint: profiles_x_handle_key
        update_columns: [wallet, email, connected_wallet, points]
      }
    ) {
      id x_handle wallet email connected_wallet points
    }
  }
`;

const UPSERT_NO_EMAIL = `
  mutation UpsertProfileNoEmail(
    $x_handle: String!,
    $wallet: String,
    $connected_wallet: String,
    $points: Int!
  ) {
    insert_profiles_one(
      object: {
        x_handle: $x_handle,
        wallet: $wallet,
        connected_wallet: $connected_wallet,
        points: $points
      }
      on_conflict: {
        constraint: profiles_x_handle_key
        update_columns: [wallet, connected_wallet, points]
      }
    ) {
      id x_handle wallet email connected_wallet points
    }
  }
`;

export async function upsertProfile(row: {
  xHandle: string;
  wallet?: string | null;
  email?: string | null;
  connectedWallet?: string | null;
  points?: number;
}) {
  const x_handle = row.xHandle.replace(/^@/, "").toLowerCase();
  const points = row.points ?? 0;
  try {
    if (row.email) {
      await nhostAdminRequest(UPSERT_FULL, {
        x_handle,
        wallet: row.wallet || null,
        email: row.email,
        connected_wallet: row.connectedWallet || null,
        points,
      });
      return;
    }
    await nhostAdminRequest(UPSERT_NO_EMAIL, {
      x_handle,
      wallet: row.wallet || null,
      connected_wallet: row.connectedWallet || null,
      points,
    });
  } catch {
    /* profiles table / constraint may be missing */
  }
}
