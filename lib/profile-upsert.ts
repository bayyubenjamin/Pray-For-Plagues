import { nhostAdminRequest } from "./nhost-server";

// Points are only written when the caller passes a SERVER-computed value
// (currently only the waitlist join, which awards WAITLIST_POINTS + social
// points computed server-side). Client-supplied points must never reach this
// function: /api/profile intentionally calls upsertProfile WITHOUT points,
// so a profile upsert can never change the points column.
const UPSERT_WITH_POINTS = `
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

const UPSERT_NO_POINTS = `
  mutation UpsertProfileNoPoints(
    $x_handle: String!,
    $wallet: String,
    $email: String,
    $connected_wallet: String
  ) {
    insert_profiles_one(
      object: {
        x_handle: $x_handle,
        wallet: $wallet,
        email: $email,
        connected_wallet: $connected_wallet
      }
      on_conflict: {
        constraint: profiles_x_handle_key
        update_columns: [wallet, email, connected_wallet]
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
  try {
    if (typeof row.points === "number") {
      await nhostAdminRequest(UPSERT_WITH_POINTS, {
        x_handle,
        wallet: row.wallet || null,
        email: row.email || null,
        connected_wallet: row.connectedWallet || null,
        points: row.points,
      });
      return;
    }
    await nhostAdminRequest(UPSERT_NO_POINTS, {
      x_handle,
      wallet: row.wallet || null,
      email: row.email || null,
      connected_wallet: row.connectedWallet || null,
    });
  } catch (err) {
    // Profiles is a mirror table; a missing table/constraint must not fail
    // the caller's request — but log it server-side so it is not invisible.
    console.warn(
      "[profile-upsert] profiles upsert skipped:",
      err instanceof Error ? err.message : err,
    );
  }
}
